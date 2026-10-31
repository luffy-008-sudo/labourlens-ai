"""KaushalSetu — FastAPI application."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.logging import get_logger, setup_logging
from app.core.settings import get_settings

logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown lifecycle."""
    setup_logging()
    settings = get_settings()
    logger.info("⚡ Labourlens AI API starting up (demo_mode=%s)", settings.demo_mode)
    from app.agents.swarm_worker import start_background_cron_daemon, stop_background_cron_daemon
    start_background_cron_daemon()
    yield
    stop_background_cron_daemon()
    logger.info("Labourlens AI API shutting down")


def create_app() -> FastAPI:
    """Factory function for the FastAPI app."""
    settings = get_settings()

    app = FastAPI(
        title="Labourlens AI API",
        description="Labourlens AI — Autonomous Multi-Agent Workforce Intelligence for 38 Tamil Nadu Districts",
        version="0.2.0",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    from app.api.admin import router as admin_router
    from app.api.districts import router as districts_router
    from app.api.guidance import router as guidance_router
    from app.api.health import router as health_router
    from app.api.runs import router as runs_router

    app.include_router(health_router, prefix="/api/v1", tags=["health"])
    app.include_router(districts_router, prefix="/api/v1", tags=["districts"])
    app.include_router(guidance_router, prefix="/api/v1", tags=["guidance"])
    app.include_router(runs_router, prefix="/api/v1", tags=["runs"])
    app.include_router(admin_router, prefix="/api/v1", tags=["admin"])

    return app


app = create_app()
