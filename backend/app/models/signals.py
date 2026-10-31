"""Demand signal and project models — agent-produced data with provenance."""

from __future__ import annotations

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base

# ──────────────────────────────────────────────
# Provenance mixin — added as columns to tables
# ──────────────────────────────────────────────
# source_id, source_url, retrieved_at, content_sha256,
# provenance_label, method, licence


class Article(Base):
    """Fetched news article or official release."""

    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(Text, unique=True, nullable=False)
    canonical_url = Column(Text, nullable=True)
    title = Column(Text, nullable=True)
    published_at = Column(DateTime, nullable=True)
    language = Column(String(10), nullable=True)
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    text = Column(Text, nullable=True)
    content_sha256 = Column(String(64), nullable=True)
    fetched_at = Column(DateTime, default=func.now())
    fetch_method = Column(String(20), nullable=True)  # trafilatura | playwright | rss

    evidence = relationship("ProjectEvidence", back_populates="article")


class SignalCandidate(Base):
    """Raw extraction result before deduplication."""

    __tablename__ = "signal_candidates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(Integer, ForeignKey("agent_runs.id"), nullable=True)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=True)
    payload = Column(JSONB, nullable=False)
    grounding_passed = Column(Boolean, default=False)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())


class Project(Base):
    """Deduplicated real-world industrial project."""

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    canonical_name = Column(String(300), nullable=True)
    company = Column(String(200), nullable=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=True)
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    place_id = Column(Integer, ForeignKey("places.id"), nullable=True)
    event_type = Column(String(30), nullable=True)
    investment_inr_cr = Column(Float, nullable=True)
    jobs_expected = Column(Integer, nullable=True)
    status = Column(String(30), nullable=True)
    first_seen = Column(DateTime, nullable=True)
    last_seen = Column(DateTime, nullable=True)
    confidence = Column(Numeric(4, 3), nullable=True)
    corroboration_count = Column(Integer, default=1)
    review_state = Column(
        String(20), default="auto"
    )  # auto | pending | approved | edited | rejected

    # Provenance
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    source_url = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, nullable=True)
    content_sha256 = Column(String(64), nullable=True)
    provenance_label = Column(String(10), default="REAL")  # REAL | ESTIMATED | MOCK
    method = Column(String(20), nullable=True)  # api | scrape | agent | manual
    licence = Column(String(100), nullable=True)

    evidence = relationship("ProjectEvidence", back_populates="project")
    cluster = relationship("Cluster")
    district = relationship("District")

    __table_args__ = (Index("ix_projects_district_cluster", "district_lgd", "cluster_id"),)


class ProjectEvidence(Base):
    """Link between a project and its supporting article."""

    __tablename__ = "project_evidence"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    evidence_quote = Column(Text, nullable=True)
    extracted_fields = Column(JSONB, nullable=True)
    source_tier = Column(String(30), nullable=True)

    project = relationship("Project", back_populates="evidence")
    article = relationship("Article", back_populates="evidence")


class PolicyTailwind(Base):
    """Government policy/scheme supporting a cluster."""

    __tablename__ = "policy_tailwinds"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=True)
    scope = Column(String(20), nullable=False)  # national | state
    name = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    source_url = Column(Text, nullable=True)
    valid_from = Column(Date, nullable=True)
    valid_to = Column(Date, nullable=True)
    review_state = Column(String(20), default="pending")
