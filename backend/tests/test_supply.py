"""Tests for training supply connector and manual CSV import validation."""

import io

import pytest
from fastapi.testclient import TestClient

from app.connectors.supply import SupplyConnector
from app.core.database import SessionLocal, engine
from app.models.analysis import AgentRun
from app.models.supply import (
    ApprenticeshipOpening,
    Institution,
    InstitutionOffering,
    Qualification,
)


@pytest.fixture(autouse=True)
def setup_supply_tables():
    """Ensure supply tables exist for test."""
    tables = [
        Institution.__table__,
        Qualification.__table__,
        InstitutionOffering.__table__,
        ApprenticeshipOpening.__table__,
        AgentRun.__table__,
    ]
    for t in tables:
        t.create(engine, checkfirst=True)
    yield
    with SessionLocal() as db:
        db.query(InstitutionOffering).delete()
        db.query(ApprenticeshipOpening).delete()
        db.query(Institution).delete()
        db.query(Qualification).delete()
        db.query(AgentRun).delete()
        db.commit()


def test_supply_ingest_institutions():
    """Verify ITIs and Polytechnics in Krishnagiri & Thoothukudi are ingested with offerings."""
    connector = SupplyConnector()
    count = connector.ingest()
    assert count > 0

    with SessionLocal() as db:
        iti_krishnagiri = (
            db.query(Institution).filter(Institution.id == "iti-krishnagiri-govt").first()
        )
        assert iti_krishnagiri is not None
        assert iti_krishnagiri.district_lgd == "582"
        assert iti_krishnagiri.type == "ITI"

        # Check offerings
        offerings = (
            db.query(InstitutionOffering)
            .filter(InstitutionOffering.institution_id == "iti-krishnagiri-govt")
            .all()
        )
        assert len(offerings) >= 2
        trades = [o.trade_name for o in offerings]
        assert any("Electrician" in t for t in trades)


def test_supply_ingest_qualifications():
    """Verify NQR qualifications with NSQF level and skills."""
    connector = SupplyConnector()
    connector.ingest()

    with SessionLocal() as db:
        quals = db.query(Qualification).all()
        assert len(quals) >= 3
        ev_qual = db.query(Qualification).filter(Qualification.nqr_code == "NQR-AUTO-EV-01").first()
        assert ev_qual is not None
        assert ev_qual.nsqf_level == 4.0
        assert "Battery Pack Assembly" in ev_qual.skills


def test_supply_ingest_apprenticeships():
    """Verify apprenticeship openings with stipend and cluster link."""
    connector = SupplyConnector()
    connector.ingest()

    with SessionLocal() as db:
        openings = db.query(ApprenticeshipOpening).all()
        assert len(openings) >= 3
        ola_app = (
            db.query(ApprenticeshipOpening)
            .filter(ApprenticeshipOpening.id == "app-ola-hosur-01")
            .first()
        )
        assert ola_app is not None
        assert ola_app.stipend_inr == 12500.0
        assert ola_app.district_lgd == "582"
        assert ola_app.cluster_id == "ev_auto"


def test_admin_csv_import_validation(client: TestClient):
    """Verify manual CSV import validates provenance columns."""
    # 1. Missing required provenance columns
    invalid_csv = "name,type,district_lgd\nGovt ITI,ITI,582\n"
    resp = client.post(
        "/api/v1/admin/import/institutions",
        files={"file": ("test.csv", io.BytesIO(invalid_csv.encode("utf-8")), "text/csv")},
    )
    assert resp.status_code == 400
    assert "CSV must include columns" in resp.json()["detail"]

    # 2. Valid CSV with provenance
    valid_csv = "id,name,type,district_lgd,source_url,provenance_label\niti-manual-1,Manual ITI,ITI,582,manual://test,REAL\n"
    resp = client.post(
        "/api/v1/admin/import/institutions",
        files={"file": ("test.csv", io.BytesIO(valid_csv.encode("utf-8")), "text/csv")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["rows_parsed"] == 1
