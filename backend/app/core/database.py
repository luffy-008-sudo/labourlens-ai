"""Database engine, session factory, and base model."""

from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.settings import get_settings


class Base(DeclarativeBase):
    """SQLAlchemy declarative base for all models."""

    pass


def get_engine():
    """Create a SQLAlchemy engine from settings."""
    settings = get_settings()
    return create_engine(
        settings.database_url,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        echo=settings.log_level == "DEBUG",
    )


def get_session_factory():
    """Create a session factory."""
    eng = get_engine()
    return sessionmaker(bind=eng, expire_on_commit=False)


# Global engine and session factory references
engine = get_engine()
SessionLocal = get_session_factory()


def get_db() -> Session:
    """Dependency: yields a DB session, rolls back on error."""
    factory = get_session_factory()
    session = factory()
    try:
        yield session  # type: ignore[misc]
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def check_db_health() -> bool:
    """Check database connectivity and required extensions."""
    engine = get_engine()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            # Check pgvector extension
            result = conn.execute(
                text("SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')")
            )
            has_vector = result.scalar()
            # Check pg_trgm extension
            result = conn.execute(
                text("SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm')")
            )
            has_trgm = result.scalar()
            return bool(has_vector and has_trgm)
    except Exception:
        return False
