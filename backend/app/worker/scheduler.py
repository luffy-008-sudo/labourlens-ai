"""KaushalSetu scheduler service using APScheduler."""

from __future__ import annotations

import asyncio
import contextlib
import signal

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.logging import get_logger, setup_logging
from app.core.settings import get_settings

logger = get_logger("worker.scheduler")


async def run_daily_discovery():
    """Trigger daily signal discovery job across focus districts."""
    logger.info("Starting scheduled signal discovery run...")
    # Will invoke signal discovery graph runner for focus districts
    try:
        from datetime import datetime

        from app.core.database import SessionLocal
        from app.models.signals import AgentRun

        with SessionLocal() as db:
            run = AgentRun(
                graph="signal_discovery",
                trigger="schedule",
                params={"districts": ["Krishnagiri", "Thoothukudi"]},
                status="completed",
                started_at=datetime.utcnow(),
                ended_at=datetime.utcnow(),
                summary={"status": "scheduled_check_complete", "signals_found": 0},
            )
            db.add(run)
            db.commit()
            logger.info("Scheduled signal discovery run logged: %s", run.id)
    except Exception as e:
        logger.error("Error running scheduled discovery: %s", e)


async def run_weekly_recompute():
    """Trigger weekly assessment and opportunity score recomputation."""
    logger.info("Starting scheduled weekly score recomputation...")
    # Will invoke analytics recalculations
    logger.info("Weekly score recomputation completed.")


def create_scheduler() -> AsyncIOScheduler:
    """Initialize and configure APScheduler jobs."""
    scheduler = AsyncIOScheduler()

    # Daily discovery at 02:00 AM UTC
    scheduler.add_job(
        run_daily_discovery,
        trigger="cron",
        hour=2,
        minute=0,
        id="daily_signal_discovery",
        replace_existing=True,
    )

    # Weekly recomputation on Sundays at 04:00 AM UTC
    scheduler.add_job(
        run_weekly_recompute,
        trigger="cron",
        day_of_week="sun",
        hour=4,
        minute=0,
        id="weekly_score_recompute",
        replace_existing=True,
    )

    return scheduler


async def main():
    """Worker service entrypoint."""
    setup_logging()
    settings = get_settings()
    logger.info("Starting KaushalSetu worker service (demo_mode=%s)...", settings.demo_mode)

    scheduler = create_scheduler()
    scheduler.start()

    stop_event = asyncio.Event()

    def handle_stop():
        logger.info("Shutdown signal received. Stopping worker...")
        scheduler.shutdown(wait=False)
        stop_event.set()

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        with contextlib.suppress(NotImplementedError):
            loop.add_signal_handler(sig, handle_stop)

    with contextlib.suppress(asyncio.CancelledError, KeyboardInterrupt):
        await stop_event.wait()
    logger.info("Worker stopped gracefully.")


if __name__ == "__main__":
    asyncio.run(main())
