"""TrustLayer Cache — Redis wrapper with TTL and claim hashing."""

import hashlib
import json
import logging
from typing import Optional

import redis.asyncio as redis

from config import CACHE_TTL_SECONDS, REDIS_URL

logger = logging.getLogger(__name__)


class TrustLayerCache:
    """Redis-backed cache for verification results."""

    def __init__(self):
        self._redis: Optional[redis.Redis] = None

    async def connect(self):
        """Initialize Redis connection."""
        try:
            self._redis = redis.from_url(REDIS_URL, decode_responses=True)
            await self._redis.ping()
            logger.info("✅ Redis connected successfully")
        except Exception as e:
            logger.warning(f"⚠️ Redis unavailable ({e}), using fallback in-memory cache")
            self._redis = None
            self._fallback: dict[str, tuple[str, float]] = {}

    async def disconnect(self):
        """Close Redis connection."""
        if self._redis:
            await self._redis.close()

    @staticmethod
    def hash_claim(text: str) -> str:
        """Generate a SHA-256 hash of normalized claim text."""
        normalized = text.strip().lower()
        return hashlib.sha256(normalized.encode()).hexdigest()[:16]

    async def get(self, claim_text: str) -> Optional[dict]:
        """Retrieve cached verification result."""
        key = f"tl:{self.hash_claim(claim_text)}"
        try:
            if self._redis:
                data = await self._redis.get(key)
                if data:
                    logger.info(f"🎯 Cache HIT for key {key}")
                    return json.loads(data)
            elif key in self._fallback:
                import time
                val, expiry = self._fallback[key]
                if time.time() < expiry:
                    logger.info(f"🎯 Fallback cache HIT for key {key}")
                    return json.loads(val)
                else:
                    del self._fallback[key]
        except Exception as e:
            logger.error(f"Cache get error: {e}")
        return None

    async def set(self, claim_text: str, result: dict, ttl: int = CACHE_TTL_SECONDS):
        """Store verification result in cache."""
        key = f"tl:{self.hash_claim(claim_text)}"
        data = json.dumps(result, default=str)
        try:
            if self._redis:
                await self._redis.set(key, data, ex=ttl)
                logger.info(f"💾 Cached result for key {key} (TTL: {ttl}s)")
            else:
                import time
                self._fallback[key] = (data, time.time() + ttl)
        except Exception as e:
            logger.error(f"Cache set error: {e}")


# Global cache instance
cache = TrustLayerCache()
