"""TrustLayer Evidence Analyzer — Uses Gemini to determine evidence stance."""

from __future__ import annotations
import json
import logging
import re

import google.generativeai as genai

from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_TEMPERATURE, SOURCE_WEIGHTS
from models import Evidence, Stance, SourceType
from services.source_aggregator import RawEvidence

logger = logging.getLogger(__name__)

genai.configure(api_key=GEMINI_API_KEY)


STANCE_PROMPT = """You are a fact-checking evidence analyzer. Given a CLAIM and a piece of EVIDENCE, determine:

1. stance: Does the evidence "supports", "contradicts", or is "neutral" about the claim?
2. relevance_score: How relevant is this evidence to the claim? (0.0 to 1.0)

Rules:
- "supports" means the evidence confirms or agrees with the claim
- "contradicts" means the evidence disputes or disproves the claim
- "neutral" means the evidence is related but doesn't clearly support or contradict
- Be precise and objective in your analysis

CLAIM: "{claim_text}"

EVIDENCE from {source_name}:
"{evidence_content}"

Return ONLY a JSON object:
{{"stance": "supports|contradicts|neutral", "relevance_score": 0.0-1.0}}"""


async def analyze_evidence(
    claim_text: str, raw_evidences: list[RawEvidence]
) -> list[Evidence]:
    """Analyze each piece of raw evidence against the claim using Gemini.
    
    Args:
        claim_text: The original claim text being verified.
        raw_evidences: List of raw evidence from knowledge sources.
        
    Returns:
        List of Evidence objects with stance and relevance scores.
    """
    if not raw_evidences:
        return []

    analyzed = []
    model = genai.GenerativeModel(GEMINI_MODEL)

    # Batch evidence into groups to minimize API calls
    batch_size = 3
    for i in range(0, len(raw_evidences), batch_size):
        batch = raw_evidences[i : i + batch_size]
        tasks = [_analyze_single(model, claim_text, ev) for ev in batch]

        # Process batch
        for task, raw_ev in zip(tasks, batch):
            evidence = await task
            if evidence:
                analyzed.append(evidence)

    logger.info(f"🔬 Analyzed {len(analyzed)} evidence items")
    return analyzed


async def _analyze_single(
    model: genai.GenerativeModel, claim_text: str, raw: RawEvidence
) -> Evidence | None:
    """Analyze a single piece of evidence against the claim."""
    try:
        prompt = STANCE_PROMPT.format(
            claim_text=claim_text,
            source_name=raw.source_name,
            evidence_content=raw.content[:400],  # Trim to save tokens
        )

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=GEMINI_TEMPERATURE,
                max_output_tokens=256,
            ),
        )

        raw_text = response.text.strip()

        # Clean markdown code blocks
        if raw_text.startswith("```"):
            raw_text = re.sub(r"^```(?:json)?\n?", "", raw_text)
            raw_text = re.sub(r"\n?```$", "", raw_text)
            raw_text = raw_text.strip()

        result = json.loads(raw_text)

        stance = Stance(result.get("stance", "neutral"))
        relevance = float(result.get("relevance_score", 0.5))
        weight = SOURCE_WEIGHTS.get(raw.source_type.value, 0.30)

        return Evidence(
            source_name=raw.source_name,
            source_type=raw.source_type,
            content=raw.content[:300],
            url=raw.url,
            stance=stance,
            relevance_score=min(max(relevance, 0.0), 1.0),
            weight=weight,
        )

    except Exception as e:
        logger.warning(f"Evidence analysis failed for {raw.source_name}: {e}")
        # Fallback keyword-matching algorithm if LLM is unavailable
        claim_lower = claim_text.lower()
        content_lower = raw.content.lower()
        
        # Simple heuristic keywords
        contradiction_keywords = ["false", "debunked", "myth", "incorrect", "wrong", "lie", "conspiracy", "not true", "disproven"]
        support_keywords = ["true", "proven", "fact", "confirmed", "correct", "accurate", "evidence shows", "scientists agree"]
        
        # Calculate scores
        contradict_score = sum(1 for kw in contradiction_keywords if kw in content_lower)
        support_score = sum(1 for kw in support_keywords if kw in content_lower)
        
        # Determine stance
        stance = Stance.NEUTRAL
        relevance = 0.3 # Base relevance
        
        # Check if the core subject is even mentioned
        subject_words = [w for w in claim_lower.split() if len(w) > 4]
        if any(w in content_lower for w in subject_words):
            relevance += 0.2
            
            if contradict_score > support_score:
                stance = Stance.CONTRADICTS
                relevance += min(contradict_score * 0.1, 0.4)
            elif support_score > contradict_score:
                stance = Stance.SUPPORTS
                relevance += min(support_score * 0.1, 0.4)

        weight = SOURCE_WEIGHTS.get(raw.source_type.value, 0.30)
        return Evidence(
            source_name=raw.source_name,
            source_type=raw.source_type,
            content=raw.content[:300],
            url=raw.url,
            stance=stance,
            relevance_score=min(max(relevance, 0.0), 1.0),
            weight=weight,
        )
