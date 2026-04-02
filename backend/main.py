"""TrustLayer — FastAPI Application Entry Point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS, BACKEND_PORT
from database import init_db
from services.cache import cache
from routers.verify import router as verify_router
from routers.auth import router as auth_router

# ── Logging Setup ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)-25s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("trustlayer")


# ── Lifespan (startup/shutdown) ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and cache on startup, cleanup on shutdown."""
    logger.info("🚀 Starting TrustLayer API...")
    await init_db()
    logger.info("✅ Database initialized")
    await cache.connect()
    logger.info("✅ Cache connected")
    logger.info("=" * 60)
    logger.info("   TrustLayer API is ready!")
    logger.info(f"   Docs: http://localhost:{BACKEND_PORT}/docs")
    logger.info("=" * 60)
    yield
    await cache.disconnect()
    logger.info("👋 TrustLayer API shut down")


# ── FastAPI App ──
app = FastAPI(
    title="TrustLayer API",
    description="Real-Time Internet Truth Verification Infrastructure",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS Middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount Routers ──
app.include_router(auth_router)
app.include_router(verify_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "TrustLayer",
        "tagline": "Real-Time Internet Truth Verification Infrastructure",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "verify": "POST /api/verify",
            "history": "GET /api/history",
            "health": "GET /api/health",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=BACKEND_PORT, reload=True)
