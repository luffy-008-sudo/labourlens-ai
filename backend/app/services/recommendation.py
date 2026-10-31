"""Learner matching and pathway recommendation service.

Spec reference: §6.5 (Graph D: learner_guidance) and §9 (Equity toggle demo contract).
Deterministic matching and ranking balancing market demand against local livelihoods.
"""

from __future__ import annotations

import math
from typing import Literal

from pydantic import BaseModel, Field


class LearnerProfile(BaseModel):
    """Anonymous learner profile — no personal identifiers (spec §4.6, §6.5)."""

    district_lgd: str = Field(..., description="LGD code of the learner's home district")
    education: str = Field("Diploma", description="Highest education level: 10th, 12th, ITI, Diploma, Degree")
    skills: list[str] = Field(default_factory=list, description="Self-reported skill chips")
    interests: list[str] = Field(default_factory=list, description="Cluster slugs of interest")
    max_travel_km: float = Field(30.0, description="Maximum commute distance in km")
    budget_inr: float | None = Field(None, description="Max fee learner can afford (None if free only)")
    relocation_willingness: bool = Field(False, description="Willingness to migrate out of home district")
    language: str = Field("en", description="Preferred output language: en, ta, hi")
    free_text: str | None = Field(None, description="Optional self-description text")


def _normalise_skill(s: str) -> str:
    """Lowercase and clean skill name for comparison."""
    return "".join(c for c in s.lower() if c.isalnum() or c.isspace()).strip()


def compute_skill_fit(
    learner_skills: list[str],
    role_skills: list[str],
    cosine_sim: float | None = None,
) -> float:
    """Compute skill fit between profile and job role.

    Formula (spec §6.5):
      0.6 * cosine(profile_skills_emb, role_skills_emb) + 0.4 * jaccard(normalised_skills)
    If embeddings are unavailable, defaults to pure Jaccard similarity.
    """
    if not role_skills:
        return 0.5
    if not learner_skills:
        return 0.2

    norm_learner = {_normalise_skill(s) for s in learner_skills if s.strip()}
    norm_role = {_normalise_skill(s) for s in role_skills if s.strip()}

    intersection = len(norm_learner.intersection(norm_role))
    union = len(norm_learner.union(norm_role))
    jaccard = (intersection / union) if union > 0 else 0.0

    if cosine_sim is not None:
        return 0.6 * max(0.0, min(1.0, cosine_sim)) + 0.4 * jaccard
    return jaccard if jaccard > 0 else 0.25


def compute_eligibility(learner_edu: str, required_nsqf: int = 4) -> float:
    """Assess whether learner education level satisfies entry requirements.

    Returns:
      1.0 if eligible
      0.4 if bridge course / foundational training is needed
    """
    edu_lower = learner_edu.lower().strip()
    learner_rank = 4

    if "postgrad" in edu_lower or "master" in edu_lower or "m.sc" in edu_lower or "m.tech" in edu_lower:
        learner_rank = 7
    elif "degree" in edu_lower or "b.sc" in edu_lower or "b.tech" in edu_lower or "b.e" in edu_lower or "graduate" in edu_lower:
        learner_rank = 6
    elif "diploma" in edu_lower or "polytechnic" in edu_lower:
        learner_rank = 5
    elif "iti" in edu_lower or "12th" in edu_lower or "higher secondary" in edu_lower:
        learner_rank = 4
    elif "10th" in edu_lower or "sslc" in edu_lower:
        learner_rank = 3
    elif "8th" in edu_lower:
        learner_rank = 2

    # NSQF level 4 requires roughly 10th/12th/ITI; NSQF 5 requires Diploma
    if learner_rank >= required_nsqf:
        return 1.0
    return 0.4


def compute_access(
    distance_km: float,
    fee_inr: float | None,
    budget_inr: float | None,
    mode: Literal["local_priority", "market"] = "local_priority",
    decay_constant: float = 40.0,
) -> float:
    """Compute geographic and financial accessibility factor.

    In local_priority mode:
      access = exp(-distance_km / 40.0) * (1.0 if fee <= budget or free else 0.5)
    In market mode:
      distance decay is turned off (access = 1.0 or financial factor only)
    """
    financial_factor = 1.0
    if fee_inr is not None and fee_inr > 0 and budget_inr is not None and fee_inr > budget_inr:
        financial_factor = 0.5

    if mode == "market":
        # Metro comparison: distance decay ignored to reflect willingness to migrate
        return financial_factor

    distance_factor = math.exp(-max(0.0, distance_km) / decay_constant)
    return distance_factor * financial_factor


def compute_route_score(
    opportunity_score: float,
    skill_fit: float,
    eligibility: float,
    interest_fit: float,
    access: float,
) -> float:
    """Compute overall route score for a recommended pathway.

    Formula (spec §6.5):
      route_score = opportunity_score(mode) * (0.5 + 0.5 * skill_fit) * eligibility * interest_fit * access
    """
    score = opportunity_score * (0.5 + 0.5 * skill_fit) * eligibility * interest_fit * access
    return round(score, 4)
