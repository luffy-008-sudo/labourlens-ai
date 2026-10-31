"""Learner guidance LangGraph graph (Graph D).

Spec reference: §6.5 (Graph D: learner_guidance).
Architecture:
  START → parse_profile → build_pathways → explain → guidance_guard → respond → END
"""

from __future__ import annotations

import uuid
from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from app.agents.nodes.learner_guidance import (
    build_pathways,
    explain_routes,
    guidance_guard,
    parse_profile,
    respond_and_persist,
)
from app.core.logging import get_logger

logger = get_logger("agents.graphs.learner_guidance")


# ─────────────────────────────────────────────────────────────────────────────
# State definition
# ─────────────────────────────────────────────────────────────────────────────


class LearnerGuidanceState(TypedDict, total=False):
    """TypedDict state for Graph D: learner guidance."""
    run_id: str
    profile: dict
    mode: str
    district_lgd: str
    routes: list
    explanation: str
    guard_passed: bool
    recommendation_id: int
    status: str


def _initial_state(
    profile: dict,
    mode: str = "local_priority",
    run_id: str | None = None,
) -> LearnerGuidanceState:
    """Build the initial state for guidance graph."""
    rid = run_id or str(uuid.uuid4())
    return LearnerGuidanceState(
        run_id=rid,
        profile=profile,
        mode=mode,
        district_lgd=str(profile.get("district_lgd", "582")),
        routes=[],
        explanation="",
        guard_passed=False,
        status="running",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Graph builder
# ─────────────────────────────────────────────────────────────────────────────


def build_guidance_graph(checkpointer: Any = None) -> Any:
    """Compile and return the learner guidance LangGraph graph."""
    builder = StateGraph(LearnerGuidanceState)

    builder.add_node("parse_profile", parse_profile)
    builder.add_node("build_pathways", build_pathways)
    builder.add_node("explain", explain_routes)
    builder.add_node("guidance_guard", guidance_guard)
    builder.add_node("respond", respond_and_persist)

    builder.add_edge(START, "parse_profile")
    builder.add_edge("parse_profile", "build_pathways")
    builder.add_edge("build_pathways", "explain")
    builder.add_edge("explain", "guidance_guard")
    builder.add_edge("guidance_guard", "respond")
    builder.add_edge("respond", END)

    if checkpointer:
        return builder.compile(checkpointer=checkpointer)
    return builder.compile()


# ─────────────────────────────────────────────────────────────────────────────
# Runner
# ─────────────────────────────────────────────────────────────────────────────


def run_learner_guidance(
    profile: dict,
    mode: str = "local_priority",
    run_id: str | None = None,
    checkpointer: Any = None,
) -> dict:
    """Run Graph D for a learner profile."""
    graph = build_guidance_graph(checkpointer=checkpointer)
    initial = _initial_state(profile, mode=mode, run_id=run_id)

    logger.info("Starting learner guidance for district=%s mode=%s", initial["district_lgd"], mode)
    result = graph.invoke(initial)
    return result

