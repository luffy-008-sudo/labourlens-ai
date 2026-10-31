"""Tests for M6 — Skill Mapping, Learner Guidance, and Equity Toggle Demo Contract (§9)."""

from __future__ import annotations

import os

os.environ["DEMO_MODE"] = "true"
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "sqlite:///./test.db")

from app.agents.graphs.learner_guidance import run_learner_guidance
from app.agents.graphs.skill_mapping import run_skill_mapping
from app.services.pathways import assemble_pathways_for_profile
from app.services.recommendation import (
    LearnerProfile,
    compute_access,
    compute_eligibility,
    compute_skill_fit,
)

# ─────────────────────────────────────────────────────────────────────────────
# Recommendation Service Tests
# ─────────────────────────────────────────────────────────────────────────────


def test_skill_fit_calculation():
    learner_skills = ["basic electrical", "multimeter", "wire splicing"]
    role_skills = ["basic electrical", "pv module mounting", "dc wiring safety"]
    fit = compute_skill_fit(learner_skills, role_skills)
    assert 0.0 < fit <= 1.0


def test_eligibility_nsqf_levels():
    # Diploma satisfies level 4 and 5
    assert compute_eligibility("Diploma", required_nsqf=4) == 1.0
    assert compute_eligibility("Diploma", required_nsqf=5) == 1.0
    # 10th standard requires bridge course for level 5
    assert compute_eligibility("10th", required_nsqf=5) == 0.4


def test_access_distance_decay_local_vs_market():
    # Distance = 280km (e.g. Krishnagiri to Chennai)
    # In local_priority: heavily decayed by exp(-280 / 40)
    acc_local = compute_access(distance_km=280.0, fee_inr=0.0, budget_inr=None, mode="local_priority")
    assert acc_local < 0.01

    # In market mode: distance decay is bypassed to model willingness to relocate
    acc_market = compute_access(distance_km=280.0, fee_inr=0.0, budget_inr=None, mode="market")
    assert acc_market == 1.0


# ─────────────────────────────────────────────────────────────────────────────
# Milestone 9: Equity Toggle Demo Contract (§9)
# ─────────────────────────────────────────────────────────────────────────────


def test_equity_toggle_demo_contract():
    """Verify that for persona 'Diploma · Electrical · Krishnagiri':

    - Local priority ON: top route is a local cluster role in Krishnagiri (EV / Auto or Solar)
    - Local priority OFF (Market Mode): top route switches to high-volume metro role (Chennai 603)
    """
    persona = LearnerProfile(
        district_lgd="582",  # Krishnagiri
        education="Diploma",
        skills=["basic electrical", "circuit testing", "wire harness"],
        interests=["ev_auto", "solar"],
        max_travel_km=30.0,
        relocation_willingness=False,
    )

    # 1. Local Priority ON
    routes_local = assemble_pathways_for_profile(persona, mode="local_priority")
    assert len(routes_local) > 0
    top_route_local = routes_local[0]

    # Must be a local cluster in Krishnagiri (e.g. EV & Auto or Solar)
    assert top_route_local["cluster"]["slug"] in ("ev_auto", "solar")
    assert top_route_local["course"]["distance_km"] <= 30.0
    assert "Ola Electric" in str(top_route_local["employers"]) or "Krishnagiri" in str(top_route_local["course"])

    # 2. Local Priority OFF (Market Mode)
    routes_market = assemble_pathways_for_profile(persona, mode="market")
    assert len(routes_market) > 0
    top_route_market = routes_market[0]

    # Must switch to the metro comparator role
    assert top_route_market["cluster"]["slug"] == "metro_it"
    assert "Chennai" in str(top_route_market["course"])

    # Crucial assertion: Top-1 route differs between modes
    assert top_route_local["role"]["title"] != top_route_market["role"]["title"]
    assert top_route_local["cluster"]["slug"] != top_route_market["cluster"]["slug"]


# ─────────────────────────────────────────────────────────────────────────────
# Graph C & D End-to-End Tests
# ─────────────────────────────────────────────────────────────────────────────


def test_skill_mapping_graph_run():
    res = run_skill_mapping("solar", run_id="sm-001")
    assert res.get("status") == "completed"
    assert len(res.get("validated_roles", [])) >= 1


def test_learner_guidance_graph_run():
    profile = {
        "district_lgd": "582",
        "education": "Diploma",
        "skills": ["basic electrical"],
        "interests": ["ev_auto"],
        "max_travel_km": 25.0,
        "language": "en",
    }
    res = run_learner_guidance(profile, mode="local_priority", run_id="lg-001")
    assert res.get("status") == "completed"
    assert len(res.get("routes", [])) >= 1
    assert "explanation" in res
    assert len(res["explanation"]) > 20
