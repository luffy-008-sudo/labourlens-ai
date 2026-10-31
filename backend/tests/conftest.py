"""Pytest configuration and common fixtures."""

import json
import os
import sqlite3

import pytest
from fastapi.testclient import TestClient
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.ext.compiler import compiles

# Register SQLite adapter for list -> JSON string
sqlite3.register_adapter(list, json.dumps)

# Ensure test mode / demo mode is active
os.environ["DEMO_MODE"] = "true"
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "sqlite:///./test.db")


# Compile Postgres-specific types gracefully on SQLite
@compiles(ARRAY, "sqlite")
def compile_array(type_, compiler, **kw):
    return "TEXT"


@compiles(JSONB, "sqlite")
def compile_jsonb(type_, compiler, **kw):
    return "TEXT"


@compiles(Vector, "sqlite")
def compile_vector(type_, compiler, **kw):
    return "TEXT"


import app.models  # noqa: E402, F401
from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.reference.loader import (  # noqa: E402
    seed_clusters,
    seed_district_indicators,
    seed_states_and_districts,
)

# Create all tables on the SQLite database if they don't exist
Base.metadata.create_all(bind=engine)

# Seed reference data for tests
with SessionLocal() as _db:
    seed_states_and_districts(_db)
    seed_clusters(_db)
    seed_district_indicators(_db)

from app.main import app  # noqa: E402


@pytest.fixture
def client():
    """FastAPI test client fixture."""
    with TestClient(app) as test_client:
        yield test_client
