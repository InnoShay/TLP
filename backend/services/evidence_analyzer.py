"""TrustLayer Evidence Analyzer — Uses Gemini to determine evidence stance."""

from __future__ import annotations
import json
import logging
import re

import google.generativeai as genai

from config import GEMINI_MODEL, GEMINI_TEMPERATURE, SOURCE_WEIGHTS
from models import Evidence, Stance, SourceType
from services.source_aggregator import RawEvidence

logger = logging.getLogger(__name__)


STANCE_PROMPT = """You are an expert fact-checking analyzer. Given a CLAIM and a piece of EVIDENCE (which might be an excerpt from a web search), determine:

1. stance: Does the evidence "supports", "contradicts", or is "neutral" about the claim?
2. relevance_score: How relevant is this evidence to the claim? (0.0 to 1.0)

CRITICAL RULES:
- "supports": The evidence confirms the claim or contains facts that align with it. If the evidence states the claim as a fact, it supports it. However, if an article merely describes people WHO believe the claim, or is debunking the claim, it does NOT support it.
- "contradicts": The evidence explicitly disputes, disproves, or debunks the claim. If it says scientists proved it wrong, or calls it a myth/conspiracy, it "contradicts".
- "neutral": The evidence is related but doesn't take a definitive factual stance, or it merely mentions the claim exists.

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
    
    # Batch evidence into groups to minimize API calls
    batch_size = 3
    for i in range(0, len(raw_evidences), batch_size):
        batch = raw_evidences[i : i + batch_size]
        tasks = [_analyze_single(claim_text, ev) for ev in batch]

        # Process batch
        for task, raw_ev in zip(tasks, batch):
            evidence = await task
            if evidence:
                analyzed.append(evidence)

    logger.info(f"🔬 Analyzed {len(analyzed)} evidence items")
    return analyzed


from config import get_next_api_key, GEMINI_MODEL, GEMINI_TEMPERATURE, SOURCE_WEIGHTS

async def _analyze_single(
    claim_text: str, raw: RawEvidence
) -> Evidence | None:
    """Analyze a single piece of evidence against the claim."""
    try:
        api_key = get_next_api_key()
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_MODEL)
        
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
        
        # Determine stance using Fuzzy Word Overlap
        claim_words = set([w.strip(".,!?;:\"'") for w in claim_lower.split() if len(w) > 3])
        content_words = set([w.strip(".,!?;:\"'") for w in content_lower.split() if len(w) > 3])
        
        overlap_count = len(claim_words.intersection(content_words))
        overlap_ratio = overlap_count / len(claim_words) if claim_words else 0.0
        
        # Heuristic scoring tiers
        if overlap_ratio > 0.4:
            # High confidence support unless contradicted
            if contradict_score > 0:
                stance = Stance.CONTRADICTS
                relevance = 0.85
            else:
                stance = Stance.SUPPORTS
                relevance = 0.90
        elif overlap_ratio > 0.2:
            # Medium confidence support
            if contradict_score > 0:
                stance = Stance.CONTRADICTS
                relevance = 0.65
            else:
                stance = Stance.SUPPORTS
                relevance = 0.75
        elif overlap_ratio > 0.05:
            # Low confidence/Partial mention
            stance = Stance.SUPPORTS
            relevance = 0.45
        else:
            # Likely just mentions a common word
            stance = Stance.NEUTRAL
            relevance = 0.30

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
