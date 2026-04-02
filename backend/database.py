"""TrustLayer Database — SQLite via SQLAlchemy async ORM."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, String, Text, Boolean, Integer
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


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    api_keys = relationship("ApiKey", back_populates="user")


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    key = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="api_keys")
    logs = relationship("ApiLog", back_populates="api_key")


class ApiLog(Base):
    __tablename__ = "api_logs"

    id = Column(String, primary_key=True)
    api_key_id = Column(String, ForeignKey("api_keys.id"), nullable=False)
    endpoint = Column(String, nullable=False)
    request_payload = Column(Text, nullable=True) # E.g., claim snippet
    response_status = Column(String, nullable=True) # Verified, Likely False, etc.
    score = Column(Float, nullable=True)
    latency = Column(Integer, nullable=False) # latency in ms
    created_at = Column(DateTime, default=datetime.utcnow)

    api_key = relationship("ApiKey", back_populates="logs")

# ── Database Initialization ──

async def init_db():
    """Create all tables if they don't exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    """Get an async database session."""
    async with async_session() as session:
        yield session
