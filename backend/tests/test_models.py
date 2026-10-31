"""Tests for SQLAlchemy model definitions and schema attributes."""

from datetime import UTC, datetime

from app.models import (
    District,
    Project,
)


def test_district_model():
    """Verify District model attributes."""
    d = District(
        district_lgd="582",
        state_lgd="33",
        name="Krishnagiri",
        aliases=["Hosur", "Dharmapuri North"],
        is_focus=True,
        is_comparator=False,
    )
    assert d.name == "Krishnagiri"
    assert d.district_lgd == "582"
    assert "Hosur" in d.aliases


def test_project_provenance():
    """Verify Project model carries required provenance fields."""
    p = Project(
        id="proj-ola-electric-1",
        canonical_name="Ola FutureFactory EV Expansion",
        company="Ola Electric",
        cluster_id="ev_auto",
        district_lgd="582",
        event_type="investment",
        investment_inr_cr=2400.0,
        jobs_expected=3000,
        status="under_construction",
        first_seen=datetime.now(UTC),
        last_seen=datetime.now(UTC),
        provenance_label="ESTIMATED",
        method="agent",
        source_url="https://pib.gov.in/example",
    )
    assert p.provenance_label == "ESTIMATED"
    assert p.investment_inr_cr == 2400.0
    assert p.company == "Ola Electric"
