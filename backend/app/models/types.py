"""Custom SQLAlchemy types with cross-dialect support (PostgreSQL & SQLite)."""

from __future__ import annotations

import json
from typing import Any

from sqlalchemy import JSON, Text, TypeDecorator
from sqlalchemy.dialects.postgresql import ARRAY


class StringList(TypeDecorator):
    """Platform-independent text array / list.

    Uses PostgreSQL's native ARRAY(Text) when available,
    and falls back to JSON-serialized lists on SQLite.
    """

    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(ARRAY(Text))
        return dialect.type_descriptor(JSON)

    def process_bind_param(self, value: Any, dialect: Any) -> Any:
        if value is None:
            return []
        if dialect.name != "postgresql" and isinstance(value, (list, tuple)):
            return list(value)
        return value

    def process_result_value(self, value: Any, dialect: Any) -> list[str]:
        if value is None:
            return []
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, list) else [value]
            except Exception:
                return [value]
        if isinstance(value, (list, tuple)):
            return list(value)
        return []
