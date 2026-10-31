"""Tests for M5 — Graph B: Cluster Assessment and Narrative Guard."""

from __future__ import annotations

import os

os.environ["DEMO_MODE"] = "true"
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "sqlite:///./test.db")


from app.agents.graphs.cluster_assessment import (
    run_cluster_assessment,
)
from app.agents.nodes.cluster_assessment import (
    classify_stage_node,
    compute_metrics,
    gather_facts,
    narrative_guard,
)


def test_gather_facts_node():
    state = {"district_lgd": "582", "cluster_slug": "ev_auto", "errors": []}
    res = gather_facts(state)
    assert "fact_pack" in res
    fp = res["fact_pack"]
    assert fp["district_lgd"] == "582"
    assert fp["cluster_slug"] == "ev_auto"
    assert "projects" in fp
    assert "msme" in fp


def test_compute_metrics_node():
    fact_pack = {
        "district_lgd": "608",
        "district_name": "Thoothukudi",
        "cluster_slug": "solar",
        "cluster_name": "Solar & Renewables",
        "projects": [
            {
                "id": 1,
                "company": "Siemens Gamesa",
                "status": "mou_signed",
                "investment_inr_cr": 1200.0,
                "jobs_expected": 800,
                "confidence": 0.85,
                "age_months": 2.0,
            }
        ],
        "msme": {"count": 400, "growth_12m_pct": 8.0, "nic_codes": ["27", "35"]},
        "industrial_parks": [{"name": "SIPCOT Thoothukudi", "sector_focus": ["solar"], "plots_available": 5}],
        "policy": {"national_tailwinds": 1, "state_tailwinds": 1},
        "training": {"total_seats": 500, "institutions": []},
        "workforce": {"related_count": 1500},
        "indicators": {"population": 1750000},
    }
    res = compute_metrics({"fact_pack": fact_pack, "errors": []})
    assert "metrics" in res
    m = res["metrics"]
    assert 0.0 <= m["momentum"] <= 1.0
    assert 0.0 <= m["cluster_depth"] <= 1.0
    assert 0.0 <= m["scalability_score"] <= 1.0
    assert m["labour_demand"] > 0
    assert m["supply"] > 0


def test_classify_stage_node():
    state = {
        "metrics": {"momentum": 0.75, "cluster_depth": 0.3},
        "fact_pack": {
            "projects": [{"age_months": 1.0}],
            "msme": {"count": 100, "growth_12m_pct": 5.0},
        },
        "errors": [],
    }
    res = classify_stage_node(state)
    assert res["stage"] == "emerging"


def test_narrative_guard_valid_citations():
    fact_pack = {
        "projects": [{"id": "12", "company": "Ola Electric"}],
        "msme": {"nic_codes": ["29"]},
        "training": {"institutions": [{"id": 45, "name": "Govt ITI"}]},
        "indicators": {"outmigration_proxy": 0.4},
    }
    valid_text = "Expanding EV components [P:12] with MSME depth [M:29] and training at [I:45]."
    state = {
        "narrative_md": valid_text,
        "fact_pack": fact_pack,
        "metrics": {},
        "stage": "emerging",
        "errors": [],
    }
    res = narrative_guard(state)
    assert res["narrative_md"] == valid_text
    assert len(res["narrative_citations"]) == 3


def test_narrative_guard_invalid_citation_triggers_fallback():
    fact_pack = {
        "district_name": "Krishnagiri",
        "cluster_name": "EV & Auto",
        "projects": [{"id": "12", "company": "Ola Electric"}],
        "msme": {"nic_codes": ["29"], "count": 1400},
        "training": {"institutions": [{"id": 45, "name": "Govt ITI"}], "total_seats": 500},
        "indicators": {},
    }
    # [P:999] does not exist in fact pack!
    hallucinated_text = "Fabricated plant [P:999] will create thousands of ungrounded jobs."
    state = {
        "narrative_md": hallucinated_text,
        "fact_pack": fact_pack,
        "metrics": {"scalability_score": 0.8},
        "stage": "emerging",
        "errors": [],
    }
    res = narrative_guard(state)
    # Guard must reject hallucinated text and replace with template
    assert res["narrative_md"] != hallucinated_text
    assert "Krishnagiri" in res["narrative_md"]
    assert "[P:12]" in res["narrative_md"]


def test_end_to_end_assessment_graph():
    """Run Graph B end-to-end for Krishnagiri EV cluster."""
    result = run_cluster_assessment(district_lgd="582", cluster_slug="ev_auto", run_id="ass-test-001")
    assert result.get("status") == "completed"
    assert "metrics" in result
    assert "stage" in result
    assert "narrative_md" in result
    assert len(result["narrative_md"]) > 50
