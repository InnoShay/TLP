"""TrustLayer Database — SQLite via SQLAlchemy async ORM."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker

from config import DATABASE_URL


# ── Engine & Session ──

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


# ── ORM Models ──

class ClaimRecord(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True)
    text = Column(Text, nullable=False)
    subject = Column(String, nullable=True)
    predicate = Column(String, nullable=True)
    object = Column(String, nullable=True)
    temporal = Column(String, nullable=True)
    source_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    verifications = relationship("VerificationRecord", back_populates="claim")


class VerificationRecord(Base):
    __tablename__ = "verifications"

    id = Column(String, primary_key=True)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False)
    truth_score = Column(Float, nullable=False)
    classification = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    original_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("ClaimRecord", back_populates="verifications")
    evidences = relationship("EvidenceRecord", back_populates="verification")


class EvidenceRecord(Base):
    __tablename__ = "evidence"

    id = Column(String, primary_key=True)
    verification_id = Column(String, ForeignKey("verifications.id"), nullable=False)
    source_name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    url = Column(Text, nullable=True)
    stance = Column(String, nullable=False)
    relevance_score = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)

    verification = relationship("VerificationRecord", back_populates="evidences")


# ── Database Initialization ──

async def init_db():
    """Create all tables if they don't exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    """Get an async database session."""
    async with async_session() as session:
        yield session
