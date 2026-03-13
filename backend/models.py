"""TrustLayer Data Models — Pydantic schemas for request/response and internal data."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ── Enums ──

class ClaimType(str, Enum):
    FACTUAL = "factual"
    STATISTICAL = "statistical"
    OPINION = "opinion"
    PREDICTION = "prediction"


class Stance(str, Enum):
    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"
    NEUTRAL = "neutral"


class Classification(str, Enum):
    VERIFIED = "Verified"
    LIKELY_TRUE = "Likely True"
    UNCERTAIN = "Uncertain"
    LIKELY_FALSE = "Likely False"
    FALSE = "False"


class SourceType(str, Enum):
    GOVERNMENT = "government"
    SCIENTIFIC_JOURNAL = "scientific_journal"
    FACT_CHECK = "fact_check"
    NEWS_AGENCY = "news_agency"
    WIKIPEDIA = "wikipedia"
    WEB_SEARCH = "web_search"


# ── Request / Response Models ──

class VerifyRequest(BaseModel):
    """Incoming verification request from the extension."""
    text: str = Field(..., min_length=5, max_length=5000, description="Text to verify")
    url: Optional[str] = Field(None, description="Source URL of the text")
    context: Optional[str] = Field(None, description="Surrounding context from the page")


class Claim(BaseModel):
    """A structured factual claim extracted from input text."""
    subject: str = Field(..., description="The entity making/receiving the action")
    predicate: str = Field(..., description="The action or relationship")
    object: str = Field(..., description="The target of the action")
    temporal: Optional[str] = Field(None, description="Time reference if any")
    original_text: str = Field(..., description="Original claim text")
    claim_type: ClaimType = Field(default=ClaimType.FACTUAL)


class Evidence(BaseModel):
    """A piece of evidence retrieved from a knowledge source."""
    source_name: str = Field(..., description="Name of the source (e.g., 'Reuters')")
    source_type: SourceType = Field(..., description="Category of the source")
    content: str = Field(..., description="Relevant excerpt from the source")
    url: Optional[str] = Field(None, description="URL of the source")
    stance: Stance = Field(..., description="Does this evidence support or contradict?")
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="How relevant is this evidence")
    weight: float = Field(..., ge=0.0, le=1.0, description="Credibility weight of the source")


class TruthScore(BaseModel):
    """The calculated truth score with classification and confidence."""
    score: float = Field(..., ge=0.0, le=1.0, description="Weighted truth score")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in the score")
    classification: Classification = Field(..., description="Human-readable classification")
    supporting_count: int = Field(default=0)
    contradicting_count: int = Field(default=0)
    neutral_count: int = Field(default=0)


class VerificationResponse(BaseModel):
    """Full verification result returned to the extension."""
    claim_id: str = Field(..., description="Unique identifier for this verification")
    original_text: str = Field(..., description="The input text that was verified")
    claims: list[Claim] = Field(default_factory=list, description="Extracted claims")
    truth_score: float = Field(..., description="Overall truth score (0-1)")
    classification: Classification = Field(...)
    confidence: float = Field(...)
    evidences: list[Evidence] = Field(default_factory=list, description="Retrieved evidence")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HistoryItem(BaseModel):
    """A past verification for the history endpoint."""
    claim_id: str
    original_text: str
    truth_score: float
    classification: Classification
    timestamp: datetime
