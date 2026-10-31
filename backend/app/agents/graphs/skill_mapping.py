"""Skill mapping LangGraph graph (Graph C).

Spec reference: §6.4 (Graph C: skill_mapping).
Architecture:
  START → load_cluster → retrieve_qualifications → propose_roles → validate_mapping → persist → END
"""

from __future__ import annotations

import uuid
from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from app.agents.nodes.skill_mapping import (
    load_cluster,
    persist_mapping,
    propose_roles,
    retrieve_qualifications,
    validate_mapping,
)
from app.core.logging import get_logger

logger = get_logger("agents.graphs.skill_mapping")


class SkillMappingState(TypedDict, total=False):
    """TypedDict state for Graph C: skill mapping."""
    run_id: str
    cluster_slug: str
    cluster_name: str
    nic_codes: list
    related_trades: list
    candidate_qualifications: list
    proposed_roles: list
    validated_roles: list
    persisted_count: int
    status: str


def _initial_state(cluster_slug: str, run_id: str | None = None) -> SkillMappingState:
    rid = run_id or str(uuid.uuid4())
    return SkillMappingState(
        run_id=rid,
        cluster_slug=cluster_slug,
        candidate_qualifications=[],
        proposed_roles=[],
        validated_roles=[],
        persisted_count=0,
        status="running",
    )


def build_skill_mapping_graph(checkpointer: Any = None) -> Any:
    """Compile and return the skill mapping LangGraph graph."""
    builder = StateGraph(SkillMappingState)

    builder.add_node("load_cluster", load_cluster)
    builder.add_node("retrieve_qualifications", retrieve_qualifications)
    builder.add_node("propose_roles", propose_roles)
    builder.add_node("validate_mapping", validate_mapping)
    builder.add_node("persist", persist_mapping)

    builder.add_edge(START, "load_cluster")
    builder.add_edge("load_cluster", "retrieve_qualifications")
    builder.add_edge("retrieve_qualifications", "propose_roles")
    builder.add_edge("propose_roles", "validate_mapping")
    builder.add_edge("validate_mapping", "persist")
    builder.add_edge("persist", END)

    if checkpointer:
        return builder.compile(checkpointer=checkpointer)
    return builder.compile()


def run_skill_mapping(cluster_slug: str, run_id: str | None = None) -> dict:
    """Run Graph C for an industry cluster."""
    graph = build_skill_mapping_graph()
    initial = _initial_state(cluster_slug, run_id=run_id)
    logger.info("Starting skill mapping for %s", cluster_slug)
    result = graph.invoke(initial)
    return result

