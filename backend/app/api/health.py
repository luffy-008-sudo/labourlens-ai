"""Health check endpoint."""

from __future__ import annotations

import contextlib

from fastapi import APIRouter

from app.core.database import check_db_health
from app.core.settings import get_settings

router = APIRouter()


@router.get("/health")
def health_check():
    """System health check — DB connectivity and extensions."""
    settings = get_settings()
    db_ok = False
    with contextlib.suppress(Exception):
        db_ok = check_db_health()

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "kaushalsetu-api",
        "version": "0.1.0",
        "demo_mode": settings.demo_mode,
        "database": "connected" if db_ok else "unavailable",
        "extensions": {
            "pgvector": db_ok,
            "pg_trgm": db_ok,
        },
    }
