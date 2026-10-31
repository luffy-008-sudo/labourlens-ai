"""Unit tests for analytics: scalability metrics, stage classification, and opportunity scoring."""

import pytest

from app.analytics.opportunity import (
    compute_equity_boost,
    compute_opportunity_score,
    run_weight_sensitivity_grid,
)
from app.analytics.scalability import (
    classify_stage,
    compute_cluster_depth,
    compute_gap,
    compute_infra_readiness,
    compute_labour_demand,
    compute_maturity,
    compute_momentum_raw,
    compute_policy_tailwind,
    compute_supply,
    percentile_rank,
)

# ─────────────────────────────────────────────────────────────────────────────
# Scalability Tests
# ─────────────────────────────────────────────────────────────────────────────


def test_percentile_rank():
    pop = [10.0, 20.0, 30.0, 40.0, 50.0]
    assert percentile_rank(30.0, pop) == 0.5
    assert percentile_rank(10.0, pop) == 0.1
    assert percentile_rank(50.0, pop) == 0.9
    assert percentile_rank(100.0, pop) == 1.0
    assert percentile_rank(0.0, pop) == 0.0


def test_momentum_raw_calculation():
    projects = [
        {
            "confidence": 0.8,
            "status": "operational",
            "age_months": 0,
            "investment_inr_cr": 100.0,
        },
        {
            "confidence": 0.9,
            "status": "under_construction",
            "age_months": 6,
            "investment_inr_cr": 500.0,
        },
    ]
    momentum = compute_momentum_raw(projects, decay_months=18.0)
    assert momentum > 0.0
    assert isinstance(momentum, float)


def test_maturity_investment_weighted():
    # operational (w=1.0) with ₹1000cr, rumoured (w=0.2) with ₹100cr
    projects = [
        {"status": "operational", "investment_inr_cr": 1000.0},
        {"status": "rumoured", "investment_inr_cr": 100.0},
    ]
    # Weighted mean should be heavily skewed towards operational (>= 0.85)
    mat = compute_maturity(projects)
    assert mat > 0.85


def test_cluster_depth():
    score = compute_cluster_depth(
        msme_count=1500,
        population=1_500_000,
        growth_12m_pct=15.0,
        all_msmes_per_lakh=[50.0, 100.0, 150.0],
        all_growths=[0.0, 10.0, 20.0],
    )
    assert 0.0 <= score <= 1.0


def test_infra_readiness():
    parks = [
        {"name": "SIPCOT Hosur", "sector_focus": ["ev_auto", "electronics"], "plots_available": 10},
        {"name": "General Park", "sector_focus": ["general"], "plots_available": 0},
    ]
    # ev_auto should get sector match + available plots bonus = 1.0
    score_ev = compute_infra_readiness(parks, "ev_auto")
    assert score_ev == 1.0

    # solar gets general park match (0.4)
    score_solar = compute_infra_readiness(parks, "solar")
    assert score_solar == 0.4


def test_policy_tailwind():
    assert compute_policy_tailwind(1, 1) == 1.0
    assert compute_policy_tailwind(1, 0) == 0.5
    assert compute_policy_tailwind(0, 0) == 0.0


def test_labour_demand_and_supply_gap():
    projects = [
        {"jobs_expected": 1000, "confidence": 1.0, "status": "operational", "age_months": 1}
    ]
    demand = compute_labour_demand(projects, apprenticeship_seats=100, job_postings_90d=50)
    # 1000 * 1.0 * 1.0 + 100 + 0.5*50 = 1125.0
    assert demand == 1125.0

    supply = compute_supply(institution_seats=500, related_workforce=2000, completion_rate=0.7)
    # 500 * 0.7 + 0.05 * 2000 = 350 + 100 = 450.0
    assert supply == 450.0

    gap_abs, gap_ratio = compute_gap(demand, supply)
    assert gap_abs == 1125.0 - 450.0  # 675.0
    assert gap_ratio == pytest.approx(675.0 / 1125.0)


def test_classify_stage_rules():
    # insufficient data
    assert classify_stage(0.8, 0.4, 10.0, num_grounded_facts=1) == "insufficient_data"

    # emerging: momentum >= 0.6 AND cluster_depth < 0.5
    assert classify_stage(0.7, 0.3, 5.0, num_grounded_facts=5) == "emerging"

    # growing: momentum >= 0.6 AND cluster_depth >= 0.5
    assert classify_stage(0.75, 0.6, 12.0, num_grounded_facts=5) == "growing"

    # established: momentum < 0.6 AND cluster_depth >= 0.6 AND msme growth >= 0
    assert classify_stage(0.4, 0.7, 5.0, num_grounded_facts=5) == "established"

    # declining: msme growth < -10% AND no new projects in 18 months
    assert classify_stage(0.2, 0.3, -15.0, num_grounded_facts=5, newest_project_age_months=20) == "declining"


# ─────────────────────────────────────────────────────────────────────────────
# Opportunity Scoring & Sensitivity Tests
# ─────────────────────────────────────────────────────────────────────────────


def test_equity_boost():
    # Krishnagiri-like vs Chennai-like
    boost_rural = compute_equity_boost(
        outmigration_val=0.45,
        all_outmigration=[0.1, 0.3, 0.45],
        income_val=120000,
        all_income=[100000, 120000, 300000],
        unemployment_val=0.08,
        all_unemployment=[0.04, 0.06, 0.08],
        aspirational_flag=False,
    )
    assert boost_rural > 0.5

    boost_metro = compute_equity_boost(
        outmigration_val=0.1,
        all_outmigration=[0.1, 0.3, 0.45],
        income_val=300000,
        all_income=[100000, 120000, 300000],
        unemployment_val=0.04,
        all_unemployment=[0.04, 0.06, 0.08],
        aspirational_flag=False,
    )
    assert boost_metro < boost_rural


def test_opportunity_score_local_priority_vs_market():
    # Local priority balances signal, gap, and equity
    score_lp, b_lp = compute_opportunity_score(
        momentum=0.8,
        gap_ratio=0.7,
        equity_boost=0.8,
        labour_demand=500.0,
        mode="local_priority",
    )
    assert 0.0 <= score_lp <= 1.0
    assert b_lp.mode == "local_priority"
    assert b_lp.weights["equity_boost"] == 0.30

    # Market mode is pure volume percentile
    score_mkt, b_mkt = compute_opportunity_score(
        momentum=0.8,
        gap_ratio=0.7,
        equity_boost=0.8,
        labour_demand=500.0,
        mode="market",
        all_market_demands=[100.0, 500.0, 2000.0],
    )
    assert b_mkt.mode == "market"
    assert b_mkt.equity_boost == 0.0


def test_weight_sensitivity_grid():
    clusters = [
        {"cluster_slug": "solar", "momentum": 0.85, "gap_ratio": 0.75, "labour_demand": 600},
        {"cluster_slug": "ev_auto", "momentum": 0.70, "gap_ratio": 0.60, "labour_demand": 400},
        {"cluster_slug": "food_processing", "momentum": 0.30, "gap_ratio": 0.20, "labour_demand": 100},
    ]
    res = run_weight_sensitivity_grid(clusters, equity_boost=0.7, min_demand=50)

    assert res["total_grid_points"] > 0
    stability = res["stability"]
    assert "solar" in stability
    assert "ev_auto" in stability
    # Solar has highest metrics, should be top-1 in all or almost all grid points
    assert stability["solar"]["top_1_share"] >= 0.90
    assert stability["food_processing"]["top_1_share"] == 0.0
