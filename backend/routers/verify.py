"""TrustLayer Verify Router — Pipeline orchestrator for claim verification."""

import logging
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_session, ClaimRecord, VerificationRecord, EvidenceRecord
from models import VerifyRequest, VerificationResponse, HistoryItem, Classification
from services.cache import cache
from services.claim_extractor import extract_claims
from services.source_aggregator import search_all_sources
from services.evidence_analyzer import analyze_evidence
from services.consensus import calculate_consensus

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["verification"])


@router.post("/verify", response_model=VerificationResponse)
async def verify_claim(request: VerifyRequest, session: AsyncSession = Depends(get_session)):
    """Full verification pipeline: Extract → Search → Analyze → Score → Store.
    
    This endpoint orchestrates the complete TrustLayer pipeline:
    1. Check cache for existing result
    2. Extract structured claims using Gemini LLM
    3. Search multiple knowledge sources in parallel
    4. Analyze evidence stance using Gemini
    5. Calculate weighted consensus score
    6. Store results in database + cache
    7. Return verification response
    """
    logger.info(f"🚀 Verification request: '{request.text[:80]}...'")

    # ── Step 1: Check cache ──
    cached = await cache.get(request.text)
    if cached:
        logger.info("⚡ Returning cached result")
        return VerificationResponse(**cached)

    # ── Step 2: Extract claims using Gemini ──
    logger.info("🧠 Step 2: Extracting claims...")
    claims = await extract_claims(request.text)
    if not claims:
        # If no claims extracted, treat the whole text as one claim
        from models import Claim, ClaimType
        claims = [Claim(
            subject="Unknown",
            predicate="states",
            object=request.text[:200],
            original_text=request.text,
            claim_type=ClaimType.FACTUAL,
        )]

    # ── Step 3: Search knowledge sources (parallel) ──
    logger.info("🔍 Step 3: Searching knowledge sources...")
    primary_claim = claims[0]  # Focus on the primary claim
    raw_evidences = await search_all_sources(primary_claim)

    # ── Step 4: Analyze evidence stance ──
    logger.info("🔬 Step 4: Analyzing evidence stance...")
    analyzed_evidences = await analyze_evidence(primary_claim.original_text, raw_evidences)

    # ── Step 5: Calculate consensus score ──
    logger.info("⚖️ Step 5: Calculating consensus score...")
    truth_score = calculate_consensus(analyzed_evidences)

    # ── Step 6: Build response ──
    claim_id = str(uuid.uuid4())[:8]
    response = VerificationResponse(
        claim_id=claim_id,
        original_text=request.text,
        claims=claims,
        truth_score=truth_score.score,
        classification=truth_score.classification,
        confidence=truth_score.confidence,
        evidences=analyzed_evidences,
        timestamp=datetime.utcnow(),
    )

    # ── Step 7: Store in database ──
    try:
        claim_record = ClaimRecord(
            id=claim_id,
            text=request.text,
            subject=primary_claim.subject,
            predicate=primary_claim.predicate,
            object=primary_claim.object,
            temporal=primary_claim.temporal,
            source_url=request.url,
        )
        session.add(claim_record)

        verification_record = VerificationRecord(
            id=str(uuid.uuid4())[:8],
            claim_id=claim_id,
            truth_score=truth_score.score,
            classification=truth_score.classification.value,
            confidence=truth_score.confidence,
            original_text=request.text,
        )
        session.add(verification_record)

        for ev in analyzed_evidences:
            ev_record = EvidenceRecord(
                id=str(uuid.uuid4())[:8],
                verification_id=verification_record.id,
                source_name=ev.source_name,
                source_type=ev.source_type.value,
                content=ev.content[:500],
                url=ev.url,
                stance=ev.stance.value,
                relevance_score=ev.relevance_score,
                weight=ev.weight,
            )
            session.add(ev_record)

        await session.commit()
        logger.info(f"💾 Stored verification {claim_id} in database")
    except Exception as e:
        logger.error(f"Database storage failed: {e}")
        await session.rollback()

    # ── Step 8: Cache the result ──
    await cache.set(request.text, response.model_dump(mode="json"))

    logger.info(
        f"✅ Verification complete: {truth_score.classification.value} "
        f"(score={truth_score.score:.3f}, confidence={truth_score.confidence:.3f})"
    )

    return response


@router.get("/history", response_model=list[HistoryItem])
async def get_history(limit: int = 20, session: AsyncSession = Depends(get_session)):
    """Retrieve recent verification history."""
    try:
        result = await session.execute(
            select(VerificationRecord)
            .order_by(VerificationRecord.created_at.desc())
            .limit(limit)
        )
        records = result.scalars().all()
        return [
            HistoryItem(
                claim_id=r.claim_id,
                original_text=r.original_text,
                truth_score=r.truth_score,
                classification=Classification(r.classification),
                timestamp=r.created_at,
            )
            for r in records
        ]
    except Exception as e:
        logger.error(f"History fetch failed: {e}")
        return []


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "TrustLayer API", "version": "1.0.0"}
