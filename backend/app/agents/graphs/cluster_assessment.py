"""Cluster assessment LangGraph graph (Graph B).

Spec reference: §6.2 (Graph B: cluster_assessment)
Architecture:
  START → gather_facts → compute_metrics → classify_stage → narrate → narrative_guard → persist → END

Triggered per district x cluster pair after persist in signal discovery,
or run on schedule for all active coverage pairs.
"""

from __future__ import annotations

import uuid
from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from app.agents.nodes.cluster_assessment import (
    classify_stage_node,
    compute_metrics,
    gather_facts,
    narrate,
    narrative_guard,
    persist_assessment,
)
from app.core.logging import get_logger

logger = get_logger("agents.graphs.cluster_assessment")


# ─────────────────────────────────────────────────────────────────────────────
# State definition
# ─────────────────────────────────────────────────────────────────────────────


class ClusterAssessmentState(TypedDict, total=False):
    """TypedDict state for Graph B: cluster assessment."""
    run_id: str
    district_lgd: str
    cluster_slug: str
    fact_pack: dict
    metrics: dict
    stage: str
    narrative_md: str
    narrative_citations: list
    persist_error: str
    status: str


def _initial_state(
    district_lgd: str,
    cluster_slug: str,
    run_id: str | None = None,
) -> ClusterAssessmentState:
    """Build the initial state for an assessment run."""
    rid = run_id or str(uuid.uuid4())
    return ClusterAssessmentState(
        run_id=rid,
        district_lgd=district_lgd,
        cluster_slug=cluster_slug,
        fact_pack={},
        metrics={},
        stage="insufficient_data",
        narrative_md="",
        narrative_citations=[],
        status="running",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Graph builder
# ─────────────────────────────────────────────────────────────────────────────


def build_assessment_graph(checkpointer: Any = None) -> Any:
    """Compile and return the cluster assessment LangGraph graph.

    Args:
        checkpointer: Optional LangGraph checkpointer.

    Returns:
        Compiled LangGraph instance.
    """
    builder = StateGraph(ClusterAssessmentState)

    builder.add_node("gather_facts", gather_facts)
    builder.add_node("compute_metrics", compute_metrics)
    builder.add_node("classify_stage", classify_stage_node)
    builder.add_node("narrate", narrate)
    builder.add_node("narrative_guard", narrative_guard)
    builder.add_node("persist", persist_assessment)

    builder.add_edge(START, "gather_facts")
    builder.add_edge("gather_facts", "compute_metrics")
    builder.add_edge("compute_metrics", "classify_stage")
    builder.add_edge("classify_stage", "narrate")
    builder.add_edge("narrate", "narrative_guard")
    builder.add_edge("narrative_guard", "persist")
    builder.add_edge("persist", END)

    if checkpointer:
        return builder.compile(checkpointer=checkpointer)
    return builder.compile()


# ─────────────────────────────────────────────────────────────────────────────
# Runner
# ─────────────────────────────────────────────────────────────────────────────


def run_cluster_assessment(
    district_lgd: str,
    cluster_slug: str,
    run_id: str | None = None,
    checkpointer: Any = None,
) -> dict:
    """Run Graph B for a single district x cluster target."""
    graph = build_assessment_graph(checkpointer=checkpointer)
    initial = _initial_state(district_lgd, cluster_slug, run_id=run_id)

    config = {}
    if checkpointer:
        config = {"configurable": {"thread_id": initial["run_id"]}}

    logger.info("Starting cluster assessment for %s / %s", district_lgd, cluster_slug)
    result = graph.invoke(initial, config=config)
    return result

