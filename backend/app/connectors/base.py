"""Base connector with rate limiting, retries, snapshots, and provenance tracking."""

from __future__ import annotations

import abc
import hashlib
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.database import SessionLocal
from app.core.logging import get_logger
from app.core.settings import DATA_DIR
from app.models.analysis import AgentRun

logger = get_logger("connectors.base")


class BaseConnector(abc.ABC):
    """Abstract base class for all data ingestion connectors."""

    def __init__(
        self,
        source_id: str,
        name: str,
        base_url: str,
        rate_limit_rps: float = 1.0,
        licence: str = "GODL-India",
    ):
        self.source_id = source_id
        self.name = name
        self.base_url = base_url
        self.rate_limit_rps = rate_limit_rps
        self.licence = licence
        self._min_interval = 1.0 / rate_limit_rps if rate_limit_rps > 0 else 0.0
        self._last_request_time = 0.0

        # Snapshot directory
        self.snapshot_dir = DATA_DIR / "snapshots"
        self.snapshot_dir.mkdir(parents=True, exist_ok=True)

    def _throttle(self) -> None:
        """Enforce rate limits per host."""
        now = time.time()
        elapsed = now - self._last_request_time
        if elapsed < self._min_interval:
            sleep_time = self._min_interval - elapsed
            time.sleep(sleep_time)
        self._last_request_time = time.time()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def http_get(
        self,
        url: str,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
        timeout: float = 30.0,
    ) -> httpx.Response:
        """Rate-limited HTTP GET request with retries."""
        self._throttle()
        req_headers = {
            "User-Agent": "KaushalSetu-Bot/1.0 (+https://github.com/kaushalsetu; public-good research)",
            "Accept": "application/json, text/plain, */*",
        }
        if headers:
            req_headers.update(headers)

        with httpx.Client(timeout=timeout) as client:
            resp = client.get(url, params=params, headers=req_headers)
            resp.raise_for_status()
            return resp

    def save_snapshot(self, content: bytes | str, ext: str = "json") -> tuple[str, Path]:
        """Save raw response content to data/snapshots/ keyed by sha256 hash."""
        raw_bytes = content.encode("utf-8") if isinstance(content, str) else content
        content_hash = hashlib.sha256(raw_bytes).hexdigest()
        file_path = self.snapshot_dir / f"{content_hash}.{ext}"

        if not file_path.exists():
            with open(file_path, "wb") as f:
                f.write(raw_bytes)
            logger.debug("Saved snapshot %s (%d bytes)", file_path.name, len(raw_bytes))

        return content_hash, file_path

    def make_provenance(
        self,
        source_url: str,
        content_sha256: str,
        provenance_label: str = "REAL",
        method: str = "api",
    ) -> dict[str, Any]:
        """Build standard provenance dictionary for row insertion."""
        return {
            "source_id": self.source_id,
            "source_url": source_url,
            "retrieved_at": datetime.now(UTC),
            "content_sha256": content_sha256,
            "provenance_label": provenance_label,
            "method": method,
            "licence": self.licence,
        }

    def log_run(
        self,
        status: str,
        records_ingested: int,
        started_at: datetime,
        error: str | None = None,
    ) -> str:
        """Record connector execution in agent_runs table."""
        ended_at = datetime.now(UTC)
        run_id = f"ingest-{self.source_id}-{int(started_at.timestamp())}"

        with SessionLocal() as db:
            run = AgentRun(
                id=run_id,
                graph=f"ingest:{self.source_id}",
                trigger="manual",
                params={"source": self.source_id, "name": self.name},
                status=status,
                started_at=started_at,
                ended_at=ended_at,
                summary={
                    "records_ingested": records_ingested,
                    "error": error,
                },
            )
            db.add(run)
            db.commit()

        logger.info(
            "Logged connector run %s: status=%s records=%d",
            run_id,
            status,
            records_ingested,
        )
        return run_id

    @abc.abstractmethod
    def fetch(self, **kwargs: Any) -> list[dict[str, Any]]:
        """Fetch raw data and return payload records."""
        pass

    @abc.abstractmethod
    def normalise(self, records: list[dict[str, Any]], **kwargs: Any) -> list[Any]:
        """Convert raw payload into SQLAlchemy model instances."""
        pass

    @abc.abstractmethod
    def ingest(self, **kwargs: Any) -> int:
        """End-to-end fetch, normalise, upsert, and log."""
        pass
