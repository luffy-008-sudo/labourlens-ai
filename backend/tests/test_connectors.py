"""Tests for deterministic connectors (OGD, Udyam, eShram, Industrial Parks)."""

import pytest

from app.connectors.industrial_parks import IndustrialParkConnector
from app.connectors.ogd import OGDConnector
from app.core.database import SessionLocal, engine
from app.models.analysis import AgentRun
from app.models.supply import IndustrialPark, MSMECount, MSMERegistrationMonthly, WorkforceAggregate


@pytest.fixture(autouse=True)
def setup_test_db():
    """Ensure database tables exist for test."""
    tables = [
        MSMECount.__table__,
        MSMERegistrationMonthly.__table__,
        WorkforceAggregate.__table__,
        IndustrialPark.__table__,
        AgentRun.__table__,
    ]
    for table in tables:
        table.create(engine, checkfirst=True)
    yield
    # Clean up test rows
    with SessionLocal() as db:
        db.query(MSMECount).delete()
        db.query(MSMERegistrationMonthly).delete()
        db.query(WorkforceAggregate).delete()
        db.query(IndustrialPark).delete()
        db.query(AgentRun).delete()
        db.commit()


def test_udyam_counts_ingestion():
    """Verify Udyam aggregate MSME counts ingestion with provenance."""
    connector = OGDConnector()
    count = connector.ingest_udyam_counts(district_lgd="582")
    assert count > 0

    with SessionLocal() as db:
        rows = db.query(MSMECount).filter(MSMECount.district_lgd == "582").all()
        assert len(rows) == count
        for r in rows:
            assert r.provenance_label in ("REAL", "MOCK", "ESTIMATED")
            assert r.source_id == "ogd_india"
            assert r.source_url is not None
            assert r.method == "api"
            assert r.count > 0


def test_udyam_monthly_aggregation_privacy():
    """Verify in-memory monthly registration aggregation prevents unit PII storage."""
    connector = OGDConnector()
    count = connector.ingest_udyam_monthly_registrations()
    assert count > 0

    with SessionLocal() as db:
        rows = db.query(MSMERegistrationMonthly).all()
        assert len(rows) == count
        for r in rows:
            assert r.new_registrations > 0
            assert r.nic2 in ("29", "27", "35", "10")
            assert r.month.day == 1  # Standardized to month start


def test_eshram_small_cell_suppression():
    """Verify privacy rule: eShram counts below 10 are strictly suppressed."""
    connector = OGDConnector()
    count = connector.ingest_eshram_aggregates()
    assert count > 0

    with SessionLocal() as db:
        rows = db.query(WorkforceAggregate).all()
        # Assert no suppressed cells (count < 10) were persisted
        for r in rows:
            assert r.count >= 10, f"Privacy violation: count {r.count} is below 10 threshold"


def test_industrial_parks_ingestion():
    """Verify SIPCOT and SIDCO industrial parks ingestion."""
    connector = IndustrialParkConnector()
    count = connector.ingest()
    assert count >= 4

    with SessionLocal() as db:
        hosur = db.query(IndustrialPark).filter(IndustrialPark.id == "sipcot-hosur-1").first()
        assert hosur is not None
        assert hosur.district_lgd == "582"
        assert hosur.operator == "SIPCOT"
        assert hosur.area_acres > 1000.0
        assert "Auto Components" in hosur.sector_focus
