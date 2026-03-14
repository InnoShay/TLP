"""TrustLayer Claim Extractor — Uses Google Gemini to extract structured factual claims."""

import json
import logging
import re
from typing import Optional

import google.generativeai as genai

from models import Claim, ClaimType

logger = logging.getLogger(__name__)


EXTRACTION_PROMPT = """You are a factual claim extraction engine. Analyze the given text and extract all verifiable factual claims.

For each claim, provide:
- subject: The main entity or topic
- predicate: The action, state, or relationship  
- object: What the subject is acting upon or related to
- temporal: Any time reference (year, date) or null if none
- original_text: The exact text of the claim
- claim_type: One of "factual", "statistical", "opinion", "prediction"

ONLY extract claims that are factual and verifiable. Skip opinions, questions, and subjective statements.

Return a JSON array of claims. Example:
[
  {{
    "subject": "India",
    "predicate": "banned",
    "object": "single-use plastics",
    "temporal": "2022",
    "original_text": "India banned single-use plastics in 2022",
    "claim_type": "factual"
  }}
]

If no verifiable claims found, return an empty array: []

TEXT TO ANALYZE:
\"\"\"
{text}
\"\"\"

Return ONLY the JSON array, no other text."""


from config import get_next_api_key, GEMINI_MODEL, GEMINI_TEMPERATURE

async def extract_claims(text: str) -> list[Claim]:
    """Extract structured factual claims from input text using Gemini.
    
    Args:
        text: Raw text to extract claims from.
        
    Returns:
        List of structured Claim objects.
    """
    try:
        api_key = get_next_api_key()
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        response = model.generate_content(
            EXTRACTION_PROMPT.format(text=text),
            generation_config=genai.types.GenerationConfig(
                temperature=GEMINI_TEMPERATURE,
                max_output_tokens=2048,
                response_mime_type="application/json"
            ),
        )

        raw = response.text.strip()
        
        # Clean markdown code blocks if present
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw)
            raw = raw.strip()

        claims_data = json.loads(raw)

        claims = []
        for item in claims_data:
            try:
                claim = Claim(
                    subject=item.get("subject", "Unknown"),
                    predicate=item.get("predicate", "states"),
                    object=item.get("object", "something"),
                    temporal=item.get("temporal"),
                    original_text=item.get("original_text", text),
                    claim_type=ClaimType(item.get("claim_type", "factual")),
                )
                # Only keep factual/statistical claims
                if claim.claim_type in (ClaimType.FACTUAL, ClaimType.STATISTICAL):
                    claims.append(claim)
            except Exception as e:
                logger.warning(f"Skipping malformed claim: {e}")

        logger.info(f"🧠 Extracted {len(claims)} factual claims from text")
        return claims

    except Exception as e:
        logger.error(f"Gemini claim extraction failed: {e}")
        # FALLBACK: If API keys are leaked or rate-limited, create a generic claim 
        # so the pipeline continues to source aggregation using offline mode.
        fallback_claim = Claim(
            subject="Unknown",
            predicate="states",
            object="something",
            temporal=None,
            original_text=text,
            claim_type=ClaimType.FACTUAL
        )
        return [fallback_claim]
