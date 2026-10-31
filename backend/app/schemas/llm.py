"""LLM structured-output schemas for KaushalSetu agents.

All schemas are Pydantic v2 models that are used with LangChain's
``with_structured_output()`` to get type-safe, validated responses
from the LLM.  The schemas are intentionally strict: missing or
implausible values are returned as ``None`` rather than invented.
"""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

# ─────────────────────────────────────────────────────────────────────────────
# Shared literals
# ─────────────────────────────────────────────────────────────────────────────

EventType = Literal[
    "new_plant",
    "expansion",
    "mou",
    "land_allotment",
    "industrial_park",
    "policy_incentive",
    "closure",
    "other",
]

ProjectStatus = Literal[
    "rumoured",
    "announced",
    "mou_signed",
    "land_allotted",
    "approved",
    "under_construction",
    "operational",
    "expansion",
    "cancelled",
]

SearchChannel = Literal["gdelt", "gnews_rss", "pib", "official_site"]


# ─────────────────────────────────────────────────────────────────────────────
# Signal discovery
# ─────────────────────────────────────────────────────────────────────────────


class IndustrySignal(BaseModel):
    """One distinct industrial project signal extracted from an article.

    Grounding rules (enforced by ``ground_check`` after extraction):
    - ``evidence_quote`` must appear verbatim in the article text.
    - Numbers in ``investment_inr_cr`` / ``jobs_expected`` must derive from
      the quote (allowing unit conversion shown in ``notes``).
    - ``district_guess`` must resolve through ``resolve_district``.
    """

    company: str | None = Field(None, description="Company or entity name, as written in the text.")
    project_name: str | None = Field(None, description="Official project name if stated.")
    cluster_slug: str = Field(
        ...,
        description=(
            "One of the known cluster slugs (solar, ev_auto, food_processing) "
            "or 'other' if no cluster matches."
        ),
    )
    other_cluster_label: str | None = Field(
        None,
        description="Human-readable label when cluster_slug == 'other'. Required in that case.",
    )
    event_type: EventType = Field(..., description="Nature of the industrial event.")
    place_mentioned: str = Field(
        ..., description="Town, park, or district name as written in the source text."
    )
    district_guess: str | None = Field(
        None, description="Agent's best guess at the LGD district name."
    )
    investment_inr_cr: float | None = Field(
        None, description="Investment in ₹ crore. Null if not stated."
    )
    jobs_expected: int | None = Field(
        None, description="Number of jobs expected. Null if not stated."
    )
    status: ProjectStatus = Field(..., description="Current project status.")
    announced_date: date | None = Field(
        None, description="Date the project was announced or reported."
    )
    evidence_quote: str = Field(
        ...,
        max_length=400,
        description=(
            "Verbatim span from the article that supports the extracted fields. "
            "Must be copied exactly from the source text."
        ),
    )
    summary: str = Field(
        ...,
        max_length=300,
        description="One-sentence plain-language summary of the project.",
    )
    notes: str | None = Field(
        None,
        description=(
            "Arithmetic or reasoning used when converting currency / units, "
            "or when making inferences. Leave null if no conversion was needed."
        ),
    )


class ExtractionResult(BaseModel):
    """Full extraction result for one article."""

    is_relevant: bool = Field(
        ...,
        description=(
            "True if the article contains at least one industrial project signal "
            "for a Tamil Nadu focus district."
        ),
    )
    signals: list[IndustrySignal] = Field(
        default_factory=list,
        description="Extracted signals.  Empty list when is_relevant is False.",
    )
    notes: str | None = Field(
        None,
        description="General notes about the article, e.g. language issues or ambiguities.",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Query generation
# ─────────────────────────────────────────────────────────────────────────────


class SearchQuery(BaseModel):
    """One search query for a district × cluster target."""

    target_district: str = Field(..., description="District name (canonical or alias).")
    target_cluster: str = Field(..., description="Cluster slug.")
    query: str = Field(..., description="The search query string.")
    language: Literal["en", "ta", "hi"] = Field("en", description="Query language.")
    channel: SearchChannel = Field("gdelt", description="Preferred search channel.")
    rationale: str | None = Field(None, description="Why this query was chosen.")


class QueryPlan(BaseModel):
    """Complete query plan produced by ``generate_queries``."""

    queries: list[SearchQuery] = Field(
        ..., description="4–8 queries per district × cluster target."
    )


# ─────────────────────────────────────────────────────────────────────────────
# Triage
# ─────────────────────────────────────────────────────────────────────────────


class TriageResult(BaseModel):
    """Relevance judgement for a single article snippet."""

    url: str
    relevant: bool
    reason: str = Field(..., max_length=200)
    likely_cluster: str | None = None
    likely_district: str | None = None


class TriageBatch(BaseModel):
    """Batch triage result for up to 20 articles."""

    results: list[TriageResult]

