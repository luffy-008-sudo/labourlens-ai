"""Analysis, learner, and system models — versioned assessments, scores, agent runs."""

from __future__ import annotations

import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID

from app.core.database import Base

# ──────────────────────────────────────
# Analysis outputs (versioned)
# ──────────────────────────────────────


class ClusterAssessment(Base):
    """Cluster assessment for a district — scores, stage, narrative."""

    __tablename__ = "cluster_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False)
    scoring_version = Column(String(20), nullable=False)

    # Sub-scores (0–1 percentiles)
    momentum = Column(Float, nullable=True)
    maturity = Column(Float, nullable=True)
    cluster_depth = Column(Float, nullable=True)
    infra_readiness = Column(Float, nullable=True)
    policy_tailwind = Column(Float, nullable=True)
    labour_demand = Column(Float, nullable=True)
    supply = Column(Float, nullable=True)
    gap_abs = Column(Float, nullable=True)
    gap_ratio = Column(Float, nullable=True)
    scalability_score = Column(Float, nullable=True)

    stage = Column(String(30), nullable=True)
    # emerging | growing | established | stable | declining | insufficient_data

    narrative_md = Column(Text, nullable=True)
    narrative_citations = Column(JSONB, nullable=True)
    computed_at = Column(DateTime, default=func.now())

    __table_args__ = (Index("ix_assessment_district_cluster", "district_lgd", "cluster_id"),)


class OpportunityScore(Base):
    """Ranked opportunity score by district × cluster × mode."""

    __tablename__ = "opportunity_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False)
    scoring_version = Column(String(20), nullable=False)
    mode = Column(String(20), nullable=False)  # local_priority | market

    signal_strength = Column(Float, nullable=True)
    skill_gap = Column(Float, nullable=True)
    equity_boost = Column(Float, nullable=True)
    viability_factor = Column(Float, nullable=True)
    score = Column(Float, nullable=True)
    rank = Column(Integer, nullable=True)
    breakdown = Column(JSONB, nullable=True)

    __table_args__ = (Index("ix_scores_district_mode", "district_lgd", "mode"),)


class ClusterRoleMap(Base):
    """Mapping: cluster → job role (NCO) → qualifications → skills."""

    __tablename__ = "cluster_role_map"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False)
    nco_code = Column(String(10), nullable=True)
    role_title = Column(String(200), nullable=False)
    qualification_ids = Column(ARRAY(Integer), default=list)
    importance = Column(String(20), nullable=True)  # core | supporting
    confidence = Column(Float, nullable=True)
    review_state = Column(String(20), default="pending")
    rationale = Column(Text, nullable=True)


class RoleSkill(Base):
    """Skills required for a job role."""

    __tablename__ = "role_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_key = Column(String(50), nullable=False)
    skill = Column(String(200), nullable=False)
    level = Column(String(20), nullable=True)  # basic | intermediate | advanced
    source = Column(String(20), nullable=True)  # NQR | agent | manual


# ──────────────────────────────────────
# Learner and system
# ──────────────────────────────────────


class LearnerSession(Base):
    """Anonymous learner session — no PII, purge after 30 days."""

    __tablename__ = "learner_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=func.now())
    district_lgd = Column(String(10), nullable=True)
    education = Column(String(100), nullable=True)
    skills = Column(ARRAY(Text), default=list)
    interests = Column(ARRAY(Text), default=list)
    constraints = Column(JSONB, nullable=True)
    language = Column(String(10), default="en")
    consent_store = Column(Boolean, default=False)


class Recommendation(Base):
    """Stored recommendation routes for a learner session."""

    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("learner_sessions.id"), nullable=False)
    mode = Column(String(20), nullable=False)
    routes = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=func.now())


class AgentRun(Base):
    """Record of an agent graph execution."""

    __tablename__ = "agent_runs"

    id = Column(String(64), primary_key=True)
    graph = Column(String(50), nullable=False)
    trigger = Column(String(20), nullable=True)  # schedule | manual | api
    params = Column(JSONB, nullable=True)
    status = Column(String(20), default="running")  # running | completed | failed | cancelled
    started_at = Column(DateTime, default=func.now())
    ended_at = Column(DateTime, nullable=True)
    token_in = Column(Integer, default=0)
    token_out = Column(Integer, default=0)
    cost_estimate = Column(Float, default=0.0)
    summary = Column(JSONB, nullable=True)


class AgentStep(Base):
    """Individual step within an agent run — powers 'Behind the data'."""

    __tablename__ = "agent_steps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(Integer, ForeignKey("agent_runs.id"), nullable=False)
    node = Column(String(100), nullable=False)
    started_at = Column(DateTime, default=func.now())
    ended_at = Column(DateTime, nullable=True)
    input_summary = Column(Text, nullable=True)
    output_summary = Column(Text, nullable=True)
    tool_calls = Column(JSONB, nullable=True)
    error = Column(Text, nullable=True)


class ReviewItem(Base):
    """Item queued for human review (signal, cluster proposal, role mapping)."""

    __tablename__ = "review_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(Integer, ForeignKey("agent_runs.id"), nullable=True)
    kind = Column(String(30), nullable=False)  # signal | cluster_proposal | role_mapping | policy
    payload = Column(JSONB, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending | approved | edited | rejected
    reviewer = Column(String(100), nullable=True)
    decided_at = Column(DateTime, nullable=True)
    decision = Column(JSONB, nullable=True)
