"""TrustLayer Consensus Calculator — Weighted truth scoring algorithm."""

import logging

from config import CLASSIFICATION_THRESHOLDS
from models import Classification, Evidence, Stance, TruthScore

logger = logging.getLogger(__name__)


def calculate_consensus(evidences: list[Evidence]) -> TruthScore:
    """Calculate the weighted truth score from analyzed evidence.
    
    Formula: Truth Score = Σ(wᵢ × sᵢ) / Σ(wᵢ)
    
    Where:
        wᵢ = source credibility weight × relevance_score
        sᵢ = stance score (supports=1.0, neutral=0.5, contradicts=0.0)
    
    Args:
        evidences: List of Evidence objects with stance, weight, and relevance.
        
    Returns:
        TruthScore with score, confidence, and classification.
    """
    if not evidences:
        return TruthScore(
            score=0.5,
            confidence=0.0,
            classification=Classification.UNCERTAIN,
            supporting_count=0,
            contradicting_count=0,
            neutral_count=0,
        )

    # Map stance to numerical score
    stance_scores = {
        Stance.SUPPORTS: 1.0,
        Stance.NEUTRAL: 0.5,
        Stance.CONTRADICTS: 0.0,
    }

    weighted_sum = 0.0
    weight_total = 0.0
    supporting = 0
    contradicting = 0
    neutral = 0

    for ev in evidences:
        stance_value = stance_scores.get(ev.stance, 0.5)
        effective_weight = ev.weight * ev.relevance_score

        weighted_sum += effective_weight * stance_value
        weight_total += effective_weight

        if ev.stance == Stance.SUPPORTS:
            supporting += 1
        elif ev.stance == Stance.CONTRADICTS:
            contradicting += 1
        else:
            neutral += 1

    # Calculate truth score
    score = weighted_sum / weight_total if weight_total > 0 else 0.5

    # Calculate confidence
    evidence_count = len(evidences)
    evidence_factor = min(evidence_count / 5.0, 1.0)  # More evidence = higher confidence

    # Agreement ratio — how much do sources agree?
    total_opinionated = supporting + contradicting
    if total_opinionated > 0:
        agreement_ratio = max(supporting, contradicting) / total_opinionated
    else:
        agreement_ratio = 0.5

    confidence = evidence_factor * agreement_ratio

    # Classify the result
    classification = _classify(score)

    logger.info(
        f"⚖️ Consensus: score={score:.3f}, confidence={confidence:.3f}, "
        f"classification={classification.value} "
        f"(S:{supporting} C:{contradicting} N:{neutral})"
    )

    return TruthScore(
        score=round(score, 4),
        confidence=round(confidence, 4),
        classification=classification,
        supporting_count=supporting,
        contradicting_count=contradicting,
        neutral_count=neutral,
    )


def _classify(score: float) -> Classification:
    """Map a truth score to a human-readable classification."""
    if score >= CLASSIFICATION_THRESHOLDS["Verified"]:
        return Classification.VERIFIED
    elif score >= CLASSIFICATION_THRESHOLDS["Likely True"]:
        return Classification.LIKELY_TRUE
    elif score >= CLASSIFICATION_THRESHOLDS["Uncertain"]:
        return Classification.UNCERTAIN
    elif score >= CLASSIFICATION_THRESHOLDS["Likely False"]:
        return Classification.LIKELY_FALSE
    else:
        return Classification.FALSE
