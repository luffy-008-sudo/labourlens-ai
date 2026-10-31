"""Signal discovery LangGraph graph (Graph A).

Architecture (from spec §6.1):
  START → plan_coverage → generate_queries → search_news → triage_articles
        → fetch_articles → extract_signals → ground_check_all
        → merge_and_dedupe → score_confidence → route_by_confidence
        → persist_signals → finalize → END

The graph runs deterministically in DEMO_MODE without any LLM calls.
In production it requires LLM_FAST_MODEL and LLM_STRONG_MODEL to be set.

Usage:
    from app.agents.graphs.signal_discovery import build_graph, run_discovery

    # One-shot run
    summary = run_discovery(run_id="run-001")

    # With a PostgresSaver checkpointer (production)
    graph = build_graph(checkpointer=saver)
    result = graph.invoke(initial_state, config={"configurable": {"thread_id": "run-001"}})
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from app.agents.nodes.signal_discovery import (
    extract_signals,
    fetch_articles,
    finalize,
    generate_queries,
    ground_check_all,
    merge_and_dedupe,
    persist_signals,
    plan_coverage,
    route_by_confidence,
    score_confidence,
    search_news,
    triage_articles,
)
from app.core.logging import get_logger

logger = get_logger("agents.graphs.signal_discovery")


# ─────────────────────────────────────────────────────────────────────────────
# State definition (TypedDict so LangGraph merges partial updates correctly)
# ─────────────────────────────────────────────────────────────────────────────


class SignalDiscoveryState(TypedDict, total=False):
    """TypedDict state for the signal discovery graph.

    Using ``total=False`` so every key is optional — nodes only need to
    return the keys they populate.  LangGraph merges partial updates into
    the accumulated state rather than replacing the whole dict.
    """
    run_id: str
    trigger: str
    targets: list
    queries: list
    seen_urls: list
    candidate_articles: list
    triaged_articles: list
    fetched_articles: list
    signal_candidates: list
    grounded_candidates: list
    failed_candidates: list
    merged_projects: list
    scored_projects: list
    projects_to_persist: list
    projects_to_review: list
    projects_rejected: list
    persisted_count: int
    review_count: int
    errors: list
    summary: dict
    status: str


def _initial_state(run_id: str | None = None, trigger: str = "manual") -> SignalDiscoveryState:
    """Build the initial state for a new run."""
    rid = run_id or str(uuid.uuid4())
    return SignalDiscoveryState(
        run_id=rid,
        trigger=trigger,
        targets=[],
        queries=[],
        seen_urls=[],
        candidate_articles=[],
        triaged_articles=[],
        fetched_articles=[],
        signal_candidates=[],
        grounded_candidates=[],
        failed_candidates=[],
        merged_projects=[],
        scored_projects=[],
        projects_to_persist=[],
        projects_to_review=[],
        projects_rejected=[],
        persisted_count=0,
        review_count=0,
        errors=[],
        summary={},
        status="running",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Graph builder
# ─────────────────────────────────────────────────────────────────────────────


def build_graph(checkpointer: Any = None) -> Any:
    """Compile and return the signal discovery LangGraph graph.

    Args:
        checkpointer: Optional ``PostgresSaver`` (or ``MemorySaver`` for tests).
                      When provided, graph runs are durable and restartable.

    Returns:
        A compiled LangGraph ``CompiledGraph``.
    """
    builder = StateGraph(SignalDiscoveryState)

    # Register nodes
    builder.add_node("plan_coverage", plan_coverage)
    builder.add_node("generate_queries", generate_queries)
    builder.add_node("search_news", search_news)
    builder.add_node("triage_articles", triage_articles)
    builder.add_node("fetch_articles", fetch_articles)
    builder.add_node("extract_signals", extract_signals)
    builder.add_node("ground_check_all", ground_check_all)
    builder.add_node("merge_and_dedupe", merge_and_dedupe)
    builder.add_node("score_confidence", score_confidence)
    builder.add_node("route_by_confidence", route_by_confidence)
    builder.add_node("persist_signals", persist_signals)
    builder.add_node("finalize", finalize)

    # Edges — linear pipeline
    builder.add_edge(START, "plan_coverage")
    builder.add_edge("plan_coverage", "generate_queries")
    builder.add_edge("generate_queries", "search_news")
    builder.add_edge("search_news", "triage_articles")
    builder.add_edge("triage_articles", "fetch_articles")
    builder.add_edge("fetch_articles", "extract_signals")
    builder.add_edge("extract_signals", "ground_check_all")
    builder.add_edge("ground_check_all", "merge_and_dedupe")
    builder.add_edge("merge_and_dedupe", "score_confidence")
    builder.add_edge("score_confidence", "route_by_confidence")
    builder.add_edge("route_by_confidence", "persist_signals")
    builder.add_edge("persist_signals", "finalize")
    builder.add_edge("finalize", END)

    if checkpointer:
        return builder.compile(checkpointer=checkpointer)
    return builder.compile()


# ─────────────────────────────────────────────────────────────────────────────
# Convenience runner
# ─────────────────────────────────────────────────────────────────────────────


def run_discovery(
    run_id: str | None = None,
    trigger: str = "manual",
    checkpointer: Any = None,
) -> dict:
    """Run the signal discovery pipeline and return the final summary.

    Args:
        run_id: Optional run ID.  A UUID is generated if not provided.
        trigger: ``schedule`` | ``manual`` | ``api``
        checkpointer: Optional LangGraph checkpointer.

    Returns:
        The ``summary`` dict from the ``finalize`` node.
    """
    graph = build_graph(checkpointer=checkpointer)
    initial = _initial_state(run_id=run_id, trigger=trigger)

    logger.info("Starting signal discovery run %s (trigger=%s)", initial["run_id"], trigger)

    # Register run in DB
    _register_run(initial["run_id"], trigger)

    config = {}
    if checkpointer:
        config = {"configurable": {"thread_id": initial["run_id"]}}

    try:
        result = graph.invoke(initial, config=config)
        return result.get("summary", {})
    except Exception as exc:
        logger.error("Signal discovery run %s failed: %s", initial["run_id"], exc)
        _mark_run_failed(initial["run_id"], str(exc))
        raise


def _register_run(run_id: str, trigger: str) -> None:
    """Write the initial agent_runs row."""
    try:
        from app.core.database import SessionLocal
        from app.models.analysis import AgentRun

        with SessionLocal() as db:
            existing = db.query(AgentRun).filter(AgentRun.id == run_id).first()
            if not existing:
                run = AgentRun(
                    id=run_id,
                    graph="signal_discovery",
                    trigger=trigger,
                    status="running",
                    started_at=datetime.now(UTC).replace(tzinfo=None),
                )
                db.add(run)
                db.commit()
    except Exception as exc:
        logger.warning("Could not register run %s: %s", run_id, exc)


def _mark_run_failed(run_id: str, error: str) -> None:
    """Mark a run as failed in the DB."""
    try:
        from app.core.database import SessionLocal
        from app.models.analysis import AgentRun

        with SessionLocal() as db:
            run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
            if run:
                run.status = "failed"
                run.ended_at = datetime.now(UTC).replace(tzinfo=None)
                run.summary = {"error": error}
                db.commit()
    except Exception:
        pass
