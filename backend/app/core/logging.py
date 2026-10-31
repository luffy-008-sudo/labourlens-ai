"""Structured logging setup for KaushalSetu."""

from __future__ import annotations

import logging

from rich.console import Console
from rich.logging import RichHandler

from app.core.settings import get_settings


def setup_logging() -> None:
    """Configure structured logging with Rich."""
    settings = get_settings()
    level = getattr(logging, settings.log_level.upper(), logging.INFO)

    # Rich handler for local dev
    console = Console(stderr=True)
    handler = RichHandler(
        console=console,
        show_time=True,
        show_path=False,
        markup=True,
        rich_tracebacks=True,
    )

    logging.basicConfig(
        level=level,
        format="%(message)s",
        datefmt="[%X]",
        handlers=[handler],
    )

    # Quiet noisy libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.DEBUG if settings.log_level == "DEBUG" else logging.WARNING
    )


def get_logger(name: str) -> logging.Logger:
    """Get a named logger."""
    return logging.getLogger(f"kaushalsetu.{name}")
