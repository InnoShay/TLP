"""TrustLayer Verify Router — Pipeline orchestrator for claim verification."""

import logging
import uuid
import time
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from database import get_session, ClaimRecord, VerificationRecord, EvidenceRecord, ApiKey, ApiLog
from models import VerifyRequest, VerificationResponse, HistoryItem, Classification, Stance
from services.cache import cache
from services.claim_extractor import extract_claims
from services.source_aggregator import search_all_sources
from services.evidence_analyzer import analyze_evidence
from services.consensus import calculate_consensus

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["verification"])
security = HTTPBearer()

async def get_optional_api_key(
    request: Request,
    session: AsyncSession = Depends(get_session)
) -> Optional[ApiKey]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.replace("Bearer ", "")
    try:
        result = await session.execute(select(ApiKey).where(ApiKey.key == token, ApiKey.is_active == True))
        return result.scalar_one_or_none()
    except Exception:
        return None


@router.post("/verify", response_model=VerificationResponse)
async def verify_claim(
    request: VerifyRequest, 
    api_key: Optional[ApiKey] = Depends(get_optional_api_key),
    session: AsyncSession = Depends(get_session)
):
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
    start_time = time.time()
    key_name = api_key.name if api_key else "Internal/Extension"
    logger.info(f"🚀 Verification request: '{request.text[:80]}...' using Key: {key_name}")

    async def save_api_log(status_class, score):
        if not api_key:
            return
        try:
            latency_ms = int((time.time() - start_time) * 1000)
            api_log = ApiLog(
                id=str(uuid.uuid4()),
                api_key_id=api_key.id,
                endpoint="/api/verify",
                request_payload=request.text[:100] if request.text else "",
                response_status=status_class,
                score=score,
                latency=latency_ms
            )
            session.add(api_log)
            # Commit log (usage is calculated dynamically in auth.py by counting logs)
            await session.commit()
        except Exception as e:
            logger.error(f"Failed to save API log: {e}")
            await session.rollback()

    # ── Step 1: Check cache ──
    cached = await cache.get(request.text)
    if cached:
        logger.info("⚡ Returning cached result")
        await save_api_log(cached.get("classification"), cached.get("truth_score"))
        return VerificationResponse(**cached)

    # ── Step 2: Extract claims using Gemini ──
    logger.info("🧠 Step 2: Extracting claims...")
    claims = await extract_claims(request.text)
    if not claims:
        # If no factual claims are found, return a definitive "Not Verifiable" result
        logger.info("❌ No verifiable factual claims found in text. Returning early.")
        claim_id = str(uuid.uuid4())[:8]
        response = VerificationResponse(
            claim_id=claim_id,
            original_text=request.text,
            claims=[],
            truth_score=0.0,
            classification=Classification.NOT_VERIFIABLE,
            confidence=0.0,
            evidences=[],
            reasoning="No verifiable factual claims were detected in the provided text.",
            timestamp=datetime.utcnow(),
        )
        await save_api_log(Classification.NOT_VERIFIABLE.value, 0.0)
        return response

    # ── Step 3: Search knowledge sources (parallel) ──
    logger.info("🔍 Step 3: Searching knowledge sources...")
    primary_claim = claims[0]  # Focus on the primary claim
    raw_evidences = await search_all_sources(primary_claim)

    # ── Step 4: Analyze evidence stance ──
    logger.info("🔬 Step 4: Analyzing evidence stance...")
    analyzed_evidences = await analyze_evidence(primary_claim.original_text, raw_evidences)

    if not analyzed_evidences:
        logger.info("❌ No verifiable evidence found. Returning Not Verifiable.")
        claim_id = str(uuid.uuid4())[:8]
        response = VerificationResponse(
            claim_id=claim_id,
            original_text=request.text,
            claims=claims,
            truth_score=0.0,
            classification=Classification.NOT_VERIFIABLE,
            confidence=0.0,
            evidences=[],
            reasoning="Searched multiple sources but could not find verifiable evidence to confirm or deny this claim.",
            timestamp=datetime.utcnow(),
        )
        await save_api_log(Classification.NOT_VERIFIABLE.value, 0.0)
        return response

    # ── Step 5: Calculate consensus score ──
    logger.info("⚖️ Step 5: Calculating consensus score...")
    truth_score = calculate_consensus(analyzed_evidences)

    # ── Step 6: Build response ──
    claim_id = str(uuid.uuid4())[:8]
    
    # Generate reasoning summary
    support_count = len([e for e in analyzed_evidences if e.stance == Stance.SUPPORTS])
    contradict_count = len([e for e in analyzed_evidences if e.stance == Stance.CONTRADICTS])
    
    reasoning = f"Analysis based on {len(analyzed_evidences)} sources. "
    if support_count > contradict_count:
        reasoning += f"Strong consensus found among {support_count} sources confirming the claim."
    elif contradict_count > support_count:
        reasoning += f"Consensus found among {contradict_count} sources contradicting the claim."
    else:
        reasoning += "Evidence is mixed or inconclusive across checked sources."

    response = VerificationResponse(
        claim_id=claim_id,
        original_text=request.text,
        claims=claims,
        truth_score=truth_score.score,
        classification=truth_score.classification,
        confidence=truth_score.confidence,
        evidences=analyzed_evidences,
        reasoning=reasoning,
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

    await save_api_log(truth_score.classification.value, truth_score.score)

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
