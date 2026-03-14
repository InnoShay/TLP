"""TrustLayer Configuration — API keys, model settings, and thresholds."""

import os
from dotenv import load_dotenv

load_dotenv()


# ── API Keys ──
import itertools

_keys_str = os.getenv("GEMINI_API_KEY", "AIzaSyDHiNumsN_1gTaqtVlEtxi4gneIwLffC30")
GEMINI_API_KEYS = [k.strip() for k in _keys_str.split(",") if k.strip()]
_key_cycle = itertools.cycle(GEMINI_API_KEYS)

def get_next_api_key() -> str:
    return next(_key_cycle)

# ── Gemini Model Settings ──
GEMINI_MODEL = "gemini-2.5-flash-lite"
GEMINI_TEMPERATURE = 0.2  # Low temperature for factual tasks

# ── Redis Settings ──
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_TTL_SECONDS = 3600  # 1 hour

# ── Source Credibility Weights ──
SOURCE_WEIGHTS = {
    "government": 0.95,
    "scientific_journal": 0.90,
    "fact_check": 0.85,
    "news_agency": 0.80,
    "wikipedia": 0.70,
    "web_search": 0.30,
}

# ── Truth Classification Thresholds ──
CLASSIFICATION_THRESHOLDS = {
    "Verified": 0.80,
    "Likely True": 0.60,
    "Uncertain": 0.40,
    "Likely False": 0.20,
    "False": 0.0,
}

# ── Database ──
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./trustlayer.db")

# ── Server ──
BACKEND_PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS = ["*"]  # Allow extension and dev origins
