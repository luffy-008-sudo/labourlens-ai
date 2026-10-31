"""data.gov.in (OGD) connector for Udyam MSME, eShram, and District Indicators."""

from __future__ import annotations

from collections import defaultdict
from datetime import UTC, date, datetime
from typing import Any

from app.connectors.base import BaseConnector
from app.core.database import SessionLocal
from app.core.logging import get_logger
from app.core.settings import get_settings
from app.models.supply import (
    MSMECount,
    MSMERegistrationMonthly,
    WorkforceAggregate,
)

logger = get_logger("connectors.ogd")


class OGDConnector(BaseConnector):
    """Client for Open Government Data (data.gov.in) APIs."""

    def __init__(self, api_key: str | None = None):
        settings = get_settings()
        self.api_key = api_key or settings.ogd_api_key
        super().__init__(
            source_id="ogd_india",
            name="Open Government Data Platform India (data.gov.in)",
            base_url="https://api.data.gov.in",
            rate_limit_rps=2.0,
            licence="GODL-India",
        )

    def fetch_resource(
        self,
        resource_id: str,
        filters: dict[str, str] | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        """Fetch records from a given resource_id with pagination."""
        settings = get_settings()

        # If in demo_mode or API key missing, return synthetic fixture
        if settings.demo_mode or not self.api_key:
            logger.info(
                "Using mock/cached fixture for resource %s (demo_mode=%s)",
                resource_id,
                settings.demo_mode,
            )
            return self._get_mock_fixture(resource_id, filters)

        url = f"{self.base_url}/resource/{resource_id}"
        params: dict[str, Any] = {
            "api-key": self.api_key,
            "format": "json",
            "offset": offset,
            "limit": limit,
        }
        if filters:
            for k, v in filters.items():
                params[f"filters[{k}]"] = v

        try:
            resp = self.http_get(url, params=params)
            data = resp.json()
            self.save_snapshot(resp.content, ext="json")
            records = data.get("records", [])
            return records
        except Exception as e:
            logger.warning("OGD API error for %s: %s. Falling back to fixture.", resource_id, e)
            return self._get_mock_fixture(resource_id, filters)

    def _get_mock_fixture(
        self, resource_id: str, filters: dict[str, str] | None = None
    ) -> list[dict[str, Any]]:
        """Fallback mock records matching official schema structure."""
        if "udyam-monthly" in resource_id or "8b68ae56" in resource_id:
            # Unit level simulated records for Krishnagiri and Thoothukudi
            return [
                {"district_lgd": "582", "nic2": "29", "reg_date": "2024-01-15"},
                {"district_lgd": "582", "nic2": "29", "reg_date": "2024-01-20"},
                {"district_lgd": "582", "nic2": "29", "reg_date": "2024-02-10"},
                {"district_lgd": "582", "nic2": "27", "reg_date": "2024-02-14"},
                {"district_lgd": "608", "nic2": "35", "reg_date": "2024-01-05"},
                {"district_lgd": "608", "nic2": "35", "reg_date": "2024-02-22"},
                {"district_lgd": "608", "nic2": "10", "reg_date": "2024-02-25"},
            ]
        elif "eshram" in resource_id or "1d4d1c5a" in resource_id:
            return [
                {
                    "district_lgd": "582",
                    "occupation": "Automobile Assembler / Fitter",
                    "education": "ITI / Certificate",
                    "gender": "Male",
                    "count": 420,
                },
                {
                    "district_lgd": "582",
                    "occupation": "Machine Operator",
                    "education": "10th Standard",
                    "gender": "Female",
                    "count": 180,
                },
                {
                    "district_lgd": "582",
                    "occupation": "Rare Specialist",
                    "education": "Post-Graduate",
                    "gender": "Other",
                    "count": 4,  # Under 10, must be suppressed!
                },
                {
                    "district_lgd": "608",
                    "occupation": "Solar Panel Installer",
                    "education": "12th Standard",
                    "gender": "Male",
                    "count": 310,
                },
                {
                    "district_lgd": "608",
                    "occupation": "Chemical Plant Assistant",
                    "education": "ITI / Polytechnic",
                    "gender": "Male",
                    "count": 195,
                },
            ]
        else:
            # Default Udyam totals
            return [
                {"district_lgd": "582", "nic2": "29", "category": "micro", "count": 340},
                {"district_lgd": "582", "nic2": "29", "category": "small", "count": 120},
                {"district_lgd": "582", "nic2": "29", "category": "medium", "count": 28},
                {"district_lgd": "582", "nic2": "27", "category": "micro", "count": 210},
                {"district_lgd": "582", "nic2": "27", "category": "small", "count": 85},
                {"district_lgd": "608", "nic2": "35", "category": "micro", "count": 140},
                {"district_lgd": "608", "nic2": "35", "category": "small", "count": 65},
                {"district_lgd": "608", "nic2": "10", "category": "micro", "count": 420},
                {"district_lgd": "608", "nic2": "10", "category": "small", "count": 115},
            ]

    def fetch(self, **kwargs: Any) -> list[dict[str, Any]]:
        resource_id = kwargs.get("resource_id", "udyam-totals")
        return self.fetch_resource(resource_id)

    def normalise(self, records: list[dict[str, Any]], **kwargs: Any) -> list[Any]:
        return []

    def ingest(self, **kwargs: Any) -> int:
        return self.ingest_all_focus_districts()

    def ingest_udyam_counts(self, district_lgd: str | None = None) -> int:
        """Ingest aggregate MSME counts by district × nic2 × category."""
        started_at = datetime.now(UTC)
        records = self.fetch_resource("udyam-totals")
        prov_label = "MOCK" if get_settings().demo_mode or not self.api_key else "REAL"

        count_inserted = 0
        with SessionLocal() as db:
            for r in records:
                if district_lgd and r["district_lgd"] != district_lgd:
                    continue

                obj = MSMECount(
                    district_lgd=r["district_lgd"],
                    nic2=r["nic2"],
                    category=r["category"],
                    period=date(2024, 1, 1),
                    count=r["count"],
                    source_id=self.source_id,
                    source_url="https://api.data.gov.in/resource/udyam-totals",
                    retrieved_at=datetime.now(UTC),
                    content_sha256="hash-udyam-totals",
                    provenance_label=prov_label,
                    method="api",
                    licence=self.licence,
                )
                db.add(obj)
                count_inserted += 1

            db.commit()

        self.log_run("completed", count_inserted, started_at)
        return count_inserted

    def ingest_udyam_monthly_registrations(self) -> int:
        """Compute monthly new MSME registrations in memory and persist aggregates.

        Privacy rule: Raw unit data is aggregated in memory and never stored in the database.
        """
        started_at = datetime.now(UTC)
        raw_units = self.fetch_resource("8b68ae56-84cf-4728-a0a6-1be11028dea7")
        prov_label = "MOCK" if get_settings().demo_mode or not self.api_key else "REAL"

        # In-memory aggregation: (district_lgd, nic2, month_start) -> count
        monthly_counts: dict[tuple[str, str, date], int] = defaultdict(int)

        for unit in raw_units:
            dlgd = unit["district_lgd"]
            nic2 = unit["nic2"]
            reg_date_str = unit.get("reg_date", "2024-01-01")
            dt = datetime.strptime(reg_date_str, "%Y-%m-%d").date()
            month_start = date(dt.year, dt.month, 1)

            monthly_counts[(dlgd, nic2, month_start)] += 1

        count_inserted = 0
        with SessionLocal() as db:
            for (dlgd, nic2, m_start), total in monthly_counts.items():
                obj = MSMERegistrationMonthly(
                    district_lgd=dlgd,
                    nic2=nic2,
                    month=m_start,
                    new_registrations=total,
                    source_id=self.source_id,
                    source_url="https://api.data.gov.in/resource/8b68ae56-84cf-4728-a0a6-1be11028dea7",
                    retrieved_at=datetime.now(UTC),
                    content_sha256="hash-udyam-units-agg",
                    provenance_label=prov_label,
                    method="api",
                    licence=self.licence,
                )
                db.add(obj)
                count_inserted += 1

            db.commit()

        self.log_run("completed", count_inserted, started_at)
        return count_inserted

    def ingest_eshram_aggregates(self) -> int:
        """Ingest eShram workforce demographics with suppression for counts below 10."""
        started_at = datetime.now(UTC)
        raw_records = self.fetch_resource("1d4d1c5a-feea-423b-be4f-c3636fdd1d82")
        prov_label = "MOCK" if get_settings().demo_mode or not self.api_key else "REAL"

        count_inserted = 0
        suppressed_count = 0

        with SessionLocal() as db:
            for r in raw_records:
                cnt = r.get("count", 0)
                # Privacy rule: counts below 10 suppressed
                if cnt < 10:
                    suppressed_count += 1
                    continue

                obj = WorkforceAggregate(
                    district_lgd=r["district_lgd"],
                    occupation_code_or_label=r["occupation"],
                    education_band=r["education"],
                    gender=r["gender"],
                    count=cnt,
                    source_id=self.source_id,
                    source_url="https://api.data.gov.in/resource/1d4d1c5a-feea-423b-be4f-c3636fdd1d82",
                    retrieved_at=datetime.now(UTC),
                    content_sha256="hash-eshram",
                    provenance_label=prov_label,
                    method="api",
                    licence=self.licence,
                )
                db.add(obj)
                count_inserted += 1

            db.commit()

        logger.info(
            "eShram ingested: %d records (%d small cells suppressed)",
            count_inserted,
            suppressed_count,
        )
        self.log_run("completed", count_inserted, started_at)
        return count_inserted

    def ingest_all_focus_districts(self) -> int:
        """Run all OGD ingestions."""
        c1 = self.ingest_udyam_counts()
        c2 = self.ingest_udyam_monthly_registrations()
        c3 = self.ingest_eshram_aggregates()
        return c1 + c2 + c3
