"""Scalability analytics — pure deterministic metrics for cluster assessment.

Spec references: §6.2 step 2 (compute_metrics) and step 3 (classify_stage).
All functions in this module are pure, testable, and have zero side effects.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Literal

from app.core.settings import get_scoring_config

StageType = Literal[
    "emerging",
    "growing",
    "established",
    "stable",
    "declining",
    "insufficient_data",
]


# ─────────────────────────────────────────────────────────────────────────────
# Percentile utilities
# ─────────────────────────────────────────────────────────────────────────────


def percentile_rank(value: float, population: list[float]) -> float:
    """Compute the percentile rank of `value` within a population (0.0 to 1.0).

    Uses rank-based percentile: proportion of values strictly less than `value`
    plus half the proportion equal to `value`.
    If population is empty or has 1 item, returns 0.5.
    """
    if not population:
        return 0.5
    if len(population) == 1:
        return 0.5

    strictly_less = sum(1 for x in population if x < value)
    equal = sum(1 for x in population if math.isclose(x, value, rel_tol=1e-5))
    return (strictly_less + 0.5 * equal) / len(population)


# ─────────────────────────────────────────────────────────────────────────────
# Sub-scores
# ─────────────────────────────────────────────────────────────────────────────


def compute_momentum_raw(
    projects: list[dict],
    decay_months: float = 18.0,
    lookback_months: float = 24.0,
) -> float:
    """Compute raw momentum score before statewide percentile ranking.

    Formula:
      Σ [ confidence × status_w × exp(-age_months / 18) × log1p(investment_cr) ]
      When investment_cr is None/0, add log1p(jobs) / 2.
    """
    total = 0.0
    scoring_cfg = get_scoring_config()
    status_weights = scoring_cfg.get("confidence", {}).get("status_weights", {})

    for p in projects:
        age_months = float(p.get("age_months", 0.0))
        if age_months > lookback_months:
            continue

        conf = float(p.get("confidence", 0.5))
        status = p.get("status", "announced")
        status_w = float(status_weights.get(status, 0.5))
        decay = math.exp(-age_months / decay_months)

        inv = p.get("investment_inr_cr")
        jobs = p.get("jobs_expected")

        if inv is not None and inv > 0:
            term = math.log1p(float(inv))
        elif jobs is not None and jobs > 0:
            term = math.log1p(float(jobs)) / 2.0
        else:
            term = 0.5  # minimal signal baseline

        total += conf * status_w * decay * term

    return total


def compute_maturity(projects: list[dict]) -> float:
    """Investment-weighted mean status_w across the cluster's projects.

    If no investment data exists, uses unweighted mean status_w.
    """
    if not projects:
        return 0.0

    scoring_cfg = get_scoring_config()
    status_weights = scoring_cfg.get("confidence", {}).get("status_weights", {})

    total_weight = 0.0
    weighted_status = 0.0
    unweighted_sum = 0.0

    for p in projects:
        status = p.get("status", "announced")
        w = float(status_weights.get(status, 0.5))
        inv = p.get("investment_inr_cr")
        if inv is not None and inv > 0:
            total_weight += float(inv)
            weighted_status += float(inv) * w
        unweighted_sum += w

    if total_weight > 0:
        return weighted_status / total_weight
    return unweighted_sum / len(projects)


def compute_cluster_depth(
    msme_count: int,
    population: int,
    growth_12m_pct: float,
    all_msmes_per_lakh: list[float] | None = None,
    all_growths: list[float] | None = None,
) -> float:
    """Compute cluster depth sub-score.

    Formula:
      0.5 × percentile(MSMEs per lakh pop) + 0.5 × percentile(12m growth)
    """
    pop_lakhs = max(population / 100_000.0, 0.01)
    msme_per_lakh = msme_count / pop_lakhs

    pct_msme = percentile_rank(msme_per_lakh, all_msmes_per_lakh or [msme_per_lakh])
    pct_growth = percentile_rank(growth_12m_pct, all_growths or [growth_12m_pct])

    return 0.5 * pct_msme + 0.5 * pct_growth


def compute_infra_readiness(parks: list[dict], cluster_slug: str) -> float:
    """Industrial park readiness.

    Rules:
      - Parks matching sector focus: 1.0
      - General manufacturing: 0.5
      - Bonus for plots_available > 0: +0.2
      - Clamped to [0.0, 1.0]
    """
    if not parks:
        return 0.1

    best = 0.0
    for park in parks:
        focus = [s.lower() for s in park.get("sector_focus", [])]
        plots = int(park.get("plots_available") or 0)

        score = 0.0
        if cluster_slug.lower() in focus or any(cluster_slug.lower() in f for f in focus):
            score = 0.8
        elif "general" in focus or "manufacturing" in focus or not focus:
            score = 0.4

        if plots > 0:
            score += 0.2

        if score > best:
            best = score

    return min(1.0, max(0.0, best))


def compute_policy_tailwind(
    approved_national: int,
    approved_state: int,
) -> float:
    """Policy tailwinds score.

    Formula: min(1, 0.5 × national + 0.5 × state)
    """
    return min(1.0, 0.5 * approved_national + 0.5 * approved_state)


def compute_labour_demand(
    projects: list[dict],
    apprenticeship_seats: int = 0,
    job_postings_90d: int = 0,
    lookback_months: float = 24.0,
) -> float:
    """Labour demand calculation.

    Formula:
      Σ [ jobs_expected × confidence × status_w ] (24m)
      + apprenticeship_seats
      + 0.5 × relevant_job_postings (90d)
    """
    total = 0.0
    scoring_cfg = get_scoring_config()
    status_weights = scoring_cfg.get("confidence", {}).get("status_weights", {})

    for p in projects:
        age_months = float(p.get("age_months", 0.0))
        if age_months > lookback_months:
            continue

        jobs = p.get("jobs_expected")
        if jobs is None or jobs <= 0:
            continue

        conf = float(p.get("confidence", 0.5))
        status = p.get("status", "announced")
        status_w = float(status_weights.get(status, 0.5))

        total += float(jobs) * conf * status_w

    total += float(apprenticeship_seats)
    total += 0.5 * float(job_postings_90d)
    return total


def compute_supply(
    institution_seats: int,
    related_workforce: int,
    completion_rate: float = 0.70,
) -> float:
    """Supply estimation.

    Formula:
      Annual trained output = Σ seats × completion_rate (default 0.7)
      + 0.05 × related_workforce (available pool proxy)
    """
    return (institution_seats * completion_rate) + (0.05 * related_workforce)


def compute_gap(labour_demand: float, supply: float) -> tuple[float, float]:
    """Compute absolute gap and gap ratio.

    Returns:
      (gap_abs, gap_ratio) where gap_abs = max(0, demand - supply)
      and gap_ratio = gap_abs / max(demand, 1).
    """
    gap_abs = max(0.0, labour_demand - supply)
    gap_ratio = gap_abs / max(labour_demand, 1.0)
    return gap_abs, min(1.0, gap_ratio)


def compute_scalability_score(
    momentum: float,
    maturity: float,
    cluster_depth: float,
    infra_readiness: float,
    policy_tailwind: float,
) -> float:
    """Combined scalability score (0 to 1).

    Weights:
      0.30 momentum + 0.20 maturity + 0.20 cluster_depth
      + 0.15 infra_readiness + 0.15 policy_tailwind
    """
    score = (
        0.30 * momentum
        + 0.20 * maturity
        + 0.20 * cluster_depth
        + 0.15 * infra_readiness
        + 0.15 * policy_tailwind
    )
    return min(1.0, max(0.0, score))


# ─────────────────────────────────────────────────────────────────────────────
# Stage Classification (§6.2 step 3)
# ─────────────────────────────────────────────────────────────────────────────


def classify_stage(
    momentum: float,
    cluster_depth: float,
    msme_growth_12m_pct: float,
    num_grounded_facts: int,
    newest_project_age_months: float | None = None,
) -> StageType:
    """Deterministic stage classification based on spec rules.

    Rules:
      - insufficient_data: fewer than 2 grounded facts
      - declining: MSME growth < -10% AND no new projects in 18 months
      - emerging: momentum >= 0.6 AND cluster_depth < 0.5 (new money, thin base)
      - growing: momentum >= 0.6 AND cluster_depth >= 0.5
      - established: momentum < 0.6 AND cluster_depth >= 0.6 AND MSME growth >= 0
      - stable: everything else with >= 1 data point
    """
    if num_grounded_facts < 2:
        return "insufficient_data"

    if msme_growth_12m_pct < -10.0 and (
        newest_project_age_months is None or newest_project_age_months > 18.0
    ):
        return "declining"

    if momentum >= 0.6 and cluster_depth < 0.5:
        return "emerging"

    if momentum >= 0.6 and cluster_depth >= 0.5:
        return "growing"

    if momentum < 0.6 and cluster_depth >= 0.6 and msme_growth_12m_pct >= 0.0:
        return "established"

    return "stable"


@dataclass
class ScalabilityResult:
    momentum: float
    maturity: float
    cluster_depth: float
    infra_readiness: float
    policy_tailwind: float
    labour_demand: float
    supply: float
    gap_abs: float
    gap_ratio: float
    scalability_score: float
    stage: StageType

