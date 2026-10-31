"""Opportunity scoring engine and weight sensitivity analysis.

Spec reference: §6.3 (Scoring engine: opportunity score).
Deterministic calculations for local_priority and market modes,
plus sensitivity analysis over weight perturbations.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any, Literal

from app.analytics.scalability import percentile_rank

# ─────────────────────────────────────────────────────────────────────────────
# Equity Boost Calculation
# ─────────────────────────────────────────────────────────────────────────────


def compute_equity_boost(
    outmigration_val: float | None = None,
    all_outmigration: list[float] | None = None,
    income_val: float | None = None,
    all_income: list[float] | None = None,
    unemployment_val: float | None = None,
    all_unemployment: list[float] | None = None,
    aspirational_flag: float | bool | None = None,
) -> float:
    """Compute the equity boost factor for a district.

    Formula:
      mean(
        percentile(outmigration_proxy),
        1 - percentile(income_proxy),
        percentile(unemployment_proxy),
        aspirational_flag (0 or 1)
      )
    Skips missing indicators and renormalises across available ones.
    Default fallback is 0.5.
    """
    terms: list[float] = []

    if outmigration_val is not None:
        p = percentile_rank(outmigration_val, all_outmigration or [outmigration_val])
        terms.append(p)

    if income_val is not None:
        p = percentile_rank(income_val, all_income or [income_val])
        terms.append(1.0 - p)  # lower income = higher equity boost

    if unemployment_val is not None:
        p = percentile_rank(unemployment_val, all_unemployment or [unemployment_val])
        terms.append(p)

    if aspirational_flag is not None:
        terms.append(1.0 if aspirational_flag else 0.0)

    if not terms:
        return 0.5

    return sum(terms) / len(terms)


# ─────────────────────────────────────────────────────────────────────────────
# Opportunity Score
# ─────────────────────────────────────────────────────────────────────────────


@dataclass
class ScoreBreakdown:
    signal_strength: float
    skill_gap: float
    equity_boost: float
    viability_factor: float
    raw_demand: float
    mode: Literal["local_priority", "market"]
    score: float
    weights: dict[str, float]


def compute_opportunity_score(
    momentum: float,
    gap_ratio: float,
    equity_boost: float,
    labour_demand: float,
    mode: Literal["local_priority", "market"] = "local_priority",
    min_demand: float = 50.0,
    job_postings_volume: float = 0.0,
    all_market_demands: list[float] | None = None,
    w_signal: float = 0.40,
    w_gap: float = 0.30,
    w_equity: float = 0.30,
) -> tuple[float, ScoreBreakdown]:
    """Compute opportunity score for a district x cluster pair.

    In local_priority mode:
      score = w_signal * signal_strength + w_gap * skill_gap + w_equity * equity_boost * viability
      where:
        signal_strength = momentum (0..1)
        skill_gap = gap_ratio (0..1)
        viability = min(1, labour_demand / min_demand)

    In market mode:
      score = percentile(labour_demand + job_postings_volume)
      (pure volume ranking, equity = 0)
    """
    signal_strength = min(1.0, max(0.0, momentum))
    skill_gap = min(1.0, max(0.0, gap_ratio))
    viability = min(1.0, max(0.0, labour_demand / max(min_demand, 1.0)))

    if mode == "market":
        raw_volume = labour_demand + job_postings_volume
        score = percentile_rank(raw_volume, all_market_demands or [raw_volume])
        breakdown = ScoreBreakdown(
            signal_strength=signal_strength,
            skill_gap=skill_gap,
            equity_boost=0.0,
            viability_factor=viability,
            raw_demand=raw_volume,
            mode="market",
            score=round(score, 4),
            weights={"labour_demand": 1.0, "equity": 0.0},
        )
        return round(score, 4), breakdown

    # local_priority mode
    score = (
        w_signal * signal_strength
        + w_gap * skill_gap
        + w_equity * (equity_boost * viability)
    )
    score = min(1.0, max(0.0, score))

    breakdown = ScoreBreakdown(
        signal_strength=round(signal_strength, 4),
        skill_gap=round(skill_gap, 4),
        equity_boost=round(equity_boost, 4),
        viability_factor=round(viability, 4),
        raw_demand=round(labour_demand, 1),
        mode="local_priority",
        score=round(score, 4),
        weights={"signal_strength": w_signal, "skill_gap": w_gap, "equity_boost": w_equity},
    )
    return round(score, 4), breakdown


# ─────────────────────────────────────────────────────────────────────────────
# Weight Sensitivity Analysis Grid (§6.3)
# ─────────────────────────────────────────────────────────────────────────────


def run_weight_sensitivity_grid(
    cluster_metrics: list[dict[str, Any]],
    equity_boost: float,
    min_demand: float = 50.0,
) -> dict[str, Any]:
    """Test rank stability over a grid of weights.

    Grid: w_signal, w_gap, w_equity in [0.2, 0.3, 0.4, 0.5, 0.6]
    such that w_signal + w_gap + w_equity == 1.0.

    Args:
      cluster_metrics: list of dicts with keys:
        'cluster_slug', 'momentum', 'gap_ratio', 'labour_demand'
      equity_boost: district equity boost value (0..1)
      min_demand: viability floor

    Returns:
      Dictionary with:
        'total_grid_points': int
        'stability': dict mapping cluster_slug to {
           'top_1_share': float (0..1),
           'top_3_share': float (0..1),
           'mean_rank': float,
           'min_rank': int,
           'max_rank': int,
        }
    """
    # Generate weight grid
    grid_points: list[tuple[float, float, float]] = []
    steps = [0.2, 0.3, 0.4, 0.5, 0.6]
    for ws in steps:
        for wg in steps:
            for we in steps:
                if math.isclose(ws + wg + we, 1.0, abs_tol=1e-4):
                    grid_points.append((round(ws, 2), round(wg, 2), round(we, 2)))

    n_points = len(grid_points)
    if n_points == 0 or not cluster_metrics:
        return {"total_grid_points": 0, "stability": {}}

    ranks_by_cluster: dict[str, list[int]] = {
        c["cluster_slug"]: [] for c in cluster_metrics
    }

    for ws, wg, we in grid_points:
        # Score each cluster
        scored: list[tuple[str, float]] = []
        for c in cluster_metrics:
            slug = c["cluster_slug"]
            score, _ = compute_opportunity_score(
                momentum=float(c.get("momentum", 0.0)),
                gap_ratio=float(c.get("gap_ratio", 0.0)),
                equity_boost=equity_boost,
                labour_demand=float(c.get("labour_demand", 0.0)),
                mode="local_priority",
                min_demand=min_demand,
                w_signal=ws,
                w_gap=wg,
                w_equity=we,
            )
            scored.append((slug, score))

        # Rank descending
        scored.sort(key=lambda x: x[1], reverse=True)
        for rank, (slug, _) in enumerate(scored, start=1):
            ranks_by_cluster[slug].append(rank)

    stability: dict[str, Any] = {}
    for slug, ranks in ranks_by_cluster.items():
        top_1 = sum(1 for r in ranks if r == 1) / n_points
        top_3 = sum(1 for r in ranks if r <= 3) / n_points
        mean_rank = sum(ranks) / len(ranks)
        stability[slug] = {
            "top_1_share": round(top_1, 3),
            "top_3_share": round(top_3, 3),
            "mean_rank": round(mean_rank, 2),
            "min_rank": min(ranks),
            "max_rank": max(ranks),
        }

    return {
        "total_grid_points": n_points,
        "stability": stability,
    }
