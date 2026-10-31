"""Initial KaushalSetu Schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-10-30 22:20:00.000000

"""

from collections.abc import Sequence

import pgvector.sqlalchemy
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # Reference tables
    op.create_table(
        "states",
        sa.Column("state_lgd", sa.String(length=10), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
    )

    op.create_table(
        "districts",
        sa.Column("district_lgd", sa.String(length=10), primary_key=True),
        sa.Column(
            "state_lgd", sa.String(length=10), sa.ForeignKey("states.state_lgd"), nullable=False
        ),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("aliases", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("is_focus", sa.Boolean(), default=False),
        sa.Column("is_comparator", sa.Boolean(), default=False),
        sa.Column("centroid_lat", sa.Float(), nullable=True),
        sa.Column("centroid_lon", sa.Float(), nullable=True),
        sa.Column("geojson", postgresql.JSONB(), nullable=True),
    )
    op.create_index(
        "ix_districts_name_trgm",
        "districts",
        ["name"],
        postgresql_using="gin",
        postgresql_ops={"name": "gin_trgm_ops"},
    )

    op.create_table(
        "places",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("aliases", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("place_type", sa.String(length=50), nullable=False),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("lon", sa.Float(), nullable=True),
    )
    op.create_index(
        "ix_places_name_trgm",
        "places",
        ["name"],
        postgresql_using="gin",
        postgresql_ops={"name": "gin_trgm_ops"},
    )

    op.create_table(
        "nic_codes",
        sa.Column("code", sa.String(length=10), primary_key=True),
        sa.Column("level", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
    )

    op.create_table(
        "nco_occupations",
        sa.Column("code", sa.String(length=10), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
    )

    op.create_table(
        "clusters",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("slug", sa.String(length=64), unique=True, nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("nic_codes", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("keywords", postgresql.JSONB(), nullable=True),
        sa.Column("status", sa.String(length=20), default="active"),
    )

    op.create_table(
        "sources",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("base_url", sa.String(length=500), nullable=False),
        sa.Column("tier", sa.String(length=40), nullable=False),
        sa.Column("rate_limit_rps", sa.Float(), default=1.0),
        sa.Column("robots_ok", sa.Boolean(), default=True),
        sa.Column("licence", sa.String(length=120), nullable=False),
        sa.Column("status", sa.String(length=30), default="active"),
    )

    # Supply tables
    op.create_table(
        "msme_counts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("nic2", sa.String(length=2), nullable=False),
        sa.Column("category", sa.String(length=20), nullable=False),
        sa.Column("period", sa.Date(), nullable=False),
        sa.Column("count", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("provenance_label", sa.String(length=16), nullable=False),
        sa.Column("method", sa.String(length=20), nullable=False),
        sa.Column("licence", sa.String(length=120), nullable=True),
    )

    op.create_table(
        "msme_registrations_monthly",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("nic2", sa.String(length=2), nullable=False),
        sa.Column("month", sa.Date(), nullable=False),
        sa.Column("new_registrations", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("provenance_label", sa.String(length=16), nullable=False),
        sa.Column("method", sa.String(length=20), nullable=False),
        sa.Column("licence", sa.String(length=120), nullable=True),
    )

    op.create_table(
        "workforce_aggregates",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("occupation_code_or_label", sa.String(length=120), nullable=False),
        sa.Column("education_band", sa.String(length=60), nullable=False),
        sa.Column("gender", sa.String(length=20), nullable=False),
        sa.Column("count", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("provenance_label", sa.String(length=16), nullable=False),
        sa.Column("method", sa.String(length=20), nullable=False),
        sa.Column("licence", sa.String(length=120), nullable=True),
    )

    op.create_table(
        "district_indicators",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("indicator", sa.String(length=80), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(length=40), nullable=True),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("provenance_label", sa.String(length=16), nullable=False),
        sa.Column("method", sa.String(length=20), nullable=False),
        sa.Column("licence", sa.String(length=120), nullable=True),
    )

    op.create_table(
        "industrial_parks",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("operator", sa.String(length=120), nullable=True),
        sa.Column("area_acres", sa.Float(), nullable=True),
        sa.Column("plots_available", sa.Integer(), nullable=True),
        sa.Column("sector_focus", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("lon", sa.Float(), nullable=True),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("provenance_label", sa.String(length=16), nullable=False),
        sa.Column("method", sa.String(length=20), nullable=False),
        sa.Column("licence", sa.String(length=120), nullable=True),
    )

    op.create_table(
        "institutions",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=40), nullable=False),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("lon", sa.Float(), nullable=True),
        sa.Column("ownership", sa.String(length=40), nullable=True),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("provenance_label", sa.String(length=16), nullable=False),
        sa.Column("method", sa.String(length=20), nullable=False),
        sa.Column("licence", sa.String(length=120), nullable=True),
    )

    op.create_table(
        "qualifications",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("nqr_code", sa.String(length=64), unique=True, nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("sector_skill_council", sa.String(length=120), nullable=True),
        sa.Column("nsqf_level", sa.Float(), nullable=True),
        sa.Column("duration_hours", sa.Integer(), nullable=True),
        sa.Column("entry_requirements", sa.Text(), nullable=True),
        sa.Column("job_roles", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("nco_codes", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("skills", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("embedding", pgvector.sqlalchemy.Vector(1024), nullable=True),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("provenance_label", sa.String(length=16), nullable=False),
        sa.Column("method", sa.String(length=20), nullable=False),
        sa.Column("licence", sa.String(length=120), nullable=True),
    )

    op.create_table(
        "institution_offerings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "institution_id", sa.String(length=64), sa.ForeignKey("institutions.id"), nullable=False
        ),
        sa.Column(
            "qualification_id", sa.Integer(), sa.ForeignKey("qualifications.id"), nullable=True
        ),
        sa.Column("trade_name", sa.String(length=180), nullable=False),
        sa.Column("seats_per_year", sa.Integer(), nullable=True),
        sa.Column("batch_size", sa.Integer(), nullable=True),
        sa.Column("fee_inr", sa.Float(), nullable=True),
        sa.Column("scheme", sa.String(length=40), default="unknown"),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("provenance_label", sa.String(length=16), nullable=False),
        sa.Column("method", sa.String(length=20), nullable=False),
        sa.Column("licence", sa.String(length=120), nullable=True),
    )

    op.create_table(
        "apprenticeship_openings",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("establishment_name", sa.String(length=255), nullable=False),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("trade_or_role", sa.String(length=180), nullable=False),
        sa.Column("cluster_id", sa.String(length=64), sa.ForeignKey("clusters.id"), nullable=True),
        sa.Column("stipend_inr", sa.Float(), nullable=True),
        sa.Column("seats", sa.Integer(), default=1),
        sa.Column("posted_at", sa.DateTime(), nullable=True),
        sa.Column("url", sa.String(length=500), nullable=True),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("provenance_label", sa.String(length=16), nullable=False),
        sa.Column("method", sa.String(length=20), nullable=False),
        sa.Column("licence", sa.String(length=120), nullable=True),
    )

    op.create_table(
        "job_postings",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("employer", sa.String(length=255), nullable=True),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("cluster_id", sa.String(length=64), sa.ForeignKey("clusters.id"), nullable=True),
        sa.Column(
            "nco_code", sa.String(length=10), sa.ForeignKey("nco_occupations.code"), nullable=True
        ),
        sa.Column("posted_at", sa.DateTime(), nullable=True),
        sa.Column("url", sa.String(length=500), nullable=True),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("provenance_label", sa.String(length=16), nullable=False),
        sa.Column("method", sa.String(length=20), nullable=False),
        sa.Column("licence", sa.String(length=120), nullable=True),
    )

    # Signals tables
    op.create_table(
        "articles",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("url", sa.String(length=1000), unique=True, nullable=False),
        sa.Column("canonical_url", sa.String(length=1000), nullable=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.Column("language", sa.String(length=10), default="en"),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("content_sha256", sa.String(length=64), nullable=False),
        sa.Column("fetched_at", sa.DateTime(), nullable=False),
        sa.Column("fetch_method", sa.String(length=30), default="http"),
    )

    op.create_table(
        "signal_candidates",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("run_id", sa.String(length=64), nullable=False),
        sa.Column("article_id", sa.Integer(), sa.ForeignKey("articles.id"), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("grounding_passed", sa.Boolean(), default=False),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "projects",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("canonical_name", sa.String(length=255), nullable=False),
        sa.Column("company", sa.String(length=255), nullable=False),
        sa.Column("cluster_id", sa.String(length=64), sa.ForeignKey("clusters.id"), nullable=False),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("place_id", sa.Integer(), sa.ForeignKey("places.id"), nullable=True),
        sa.Column("event_type", sa.String(length=60), nullable=False),
        sa.Column("investment_inr_cr", sa.Float(), nullable=True),
        sa.Column("jobs_expected", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("first_seen", sa.DateTime(), nullable=False),
        sa.Column("last_seen", sa.DateTime(), nullable=False),
        sa.Column("confidence", sa.Float(), default=0.5),
        sa.Column("corroboration_count", sa.Integer(), default=1),
        sa.Column("review_state", sa.String(length=20), default="auto"),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("sources.id"), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("provenance_label", sa.String(length=16), nullable=False),
        sa.Column("method", sa.String(length=20), nullable=False),
        sa.Column("licence", sa.String(length=120), nullable=True),
    )

    op.create_table(
        "project_evidence",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("project_id", sa.String(length=64), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("article_id", sa.Integer(), sa.ForeignKey("articles.id"), nullable=False),
        sa.Column("evidence_quote", sa.Text(), nullable=False),
        sa.Column("extracted_fields", postgresql.JSONB(), nullable=True),
        sa.Column("source_tier", sa.String(length=40), nullable=False),
    )

    op.create_table(
        "policy_tailwinds",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("cluster_id", sa.String(length=64), sa.ForeignKey("clusters.id"), nullable=False),
        sa.Column("scope", sa.String(length=20), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("valid_from", sa.Date(), nullable=True),
        sa.Column("valid_to", sa.Date(), nullable=True),
        sa.Column("review_state", sa.String(length=20), default="auto"),
    )

    # Analysis tables
    op.create_table(
        "cluster_assessments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("cluster_id", sa.String(length=64), sa.ForeignKey("clusters.id"), nullable=False),
        sa.Column("scoring_version", sa.String(length=20), nullable=False),
        sa.Column("momentum", sa.Float(), nullable=False),
        sa.Column("maturity", sa.Float(), nullable=False),
        sa.Column("cluster_depth", sa.Float(), nullable=False),
        sa.Column("infra_readiness", sa.Float(), nullable=False),
        sa.Column("policy_tailwind", sa.Float(), nullable=False),
        sa.Column("labour_demand", sa.Float(), nullable=False),
        sa.Column("supply", sa.Float(), nullable=False),
        sa.Column("gap_abs", sa.Float(), nullable=False),
        sa.Column("gap_ratio", sa.Float(), nullable=False),
        sa.Column("scalability_score", sa.Float(), nullable=False),
        sa.Column("stage", sa.String(length=30), nullable=False),
        sa.Column("narrative_md", sa.Text(), nullable=True),
        sa.Column("narrative_citations", postgresql.JSONB(), nullable=True),
        sa.Column("computed_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "opportunity_scores",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("cluster_id", sa.String(length=64), sa.ForeignKey("clusters.id"), nullable=False),
        sa.Column("scoring_version", sa.String(length=20), nullable=False),
        sa.Column("mode", sa.String(length=30), nullable=False),
        sa.Column("signal_strength", sa.Float(), nullable=False),
        sa.Column("skill_gap", sa.Float(), nullable=False),
        sa.Column("equity_boost", sa.Float(), nullable=False),
        sa.Column("viability_factor", sa.Float(), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.Column("breakdown", postgresql.JSONB(), nullable=True),
    )

    op.create_table(
        "cluster_role_map",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("cluster_id", sa.String(length=64), sa.ForeignKey("clusters.id"), nullable=False),
        sa.Column(
            "nco_code", sa.String(length=10), sa.ForeignKey("nco_occupations.code"), nullable=False
        ),
        sa.Column("role_title", sa.String(length=180), nullable=False),
        sa.Column("qualification_ids", postgresql.ARRAY(sa.Integer()), nullable=True),
        sa.Column("importance", sa.Float(), default=1.0),
        sa.Column("confidence", sa.Float(), default=0.5),
        sa.Column("review_state", sa.String(length=20), default="auto"),
        sa.Column("rationale", sa.Text(), nullable=True),
    )

    op.create_table(
        "role_skills",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("role_key", sa.String(length=120), nullable=False),
        sa.Column("skill", sa.String(length=120), nullable=False),
        sa.Column("level", sa.String(length=30), nullable=False),
        sa.Column("source", sa.String(length=30), default="NQR"),
    )

    # Learner & System tables
    op.create_table(
        "learner_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column(
            "district_lgd",
            sa.String(length=10),
            sa.ForeignKey("districts.district_lgd"),
            nullable=False,
        ),
        sa.Column("education", sa.String(length=60), nullable=False),
        sa.Column("skills", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("interests", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("constraints", postgresql.JSONB(), nullable=True),
        sa.Column("language", sa.String(length=10), default="en"),
        sa.Column("consent_store", sa.Boolean(), default=False),
    )

    op.create_table(
        "recommendations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "session_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("learner_sessions.id"),
            nullable=False,
        ),
        sa.Column("mode", sa.String(length=30), nullable=False),
        sa.Column("routes", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "agent_runs",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("graph", sa.String(length=64), nullable=False),
        sa.Column("trigger", sa.String(length=30), default="manual"),
        sa.Column("params", postgresql.JSONB(), nullable=True),
        sa.Column("status", sa.String(length=30), default="running"),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("ended_at", sa.DateTime(), nullable=True),
        sa.Column("token_in", sa.Integer(), default=0),
        sa.Column("token_out", sa.Integer(), default=0),
        sa.Column("cost_estimate", sa.Float(), default=0.0),
        sa.Column("summary", postgresql.JSONB(), nullable=True),
    )

    op.create_table(
        "agent_steps",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("run_id", sa.String(length=64), sa.ForeignKey("agent_runs.id"), nullable=False),
        sa.Column("node", sa.String(length=64), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("ended_at", sa.DateTime(), nullable=True),
        sa.Column("input_summary", sa.Text(), nullable=True),
        sa.Column("output_summary", sa.Text(), nullable=True),
        sa.Column("tool_calls", postgresql.JSONB(), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
    )

    op.create_table(
        "review_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("run_id", sa.String(length=64), sa.ForeignKey("agent_runs.id"), nullable=False),
        sa.Column("kind", sa.String(length=40), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), default="pending"),
        sa.Column("reviewer", sa.String(length=80), nullable=True),
        sa.Column("decided_at", sa.DateTime(), nullable=True),
        sa.Column("decision", postgresql.JSONB(), nullable=True),
    )


def downgrade() -> None:
    # Downgrade drops all tables in reverse dependency order
    op.drop_table("review_items")
    op.drop_table("agent_steps")
    op.drop_table("agent_runs")
    op.drop_table("recommendations")
    op.drop_table("learner_sessions")
    op.drop_table("role_skills")
    op.drop_table("cluster_role_map")
    op.drop_table("opportunity_scores")
    op.drop_table("cluster_assessments")
    op.drop_table("policy_tailwinds")
    op.drop_table("project_evidence")
    op.drop_table("projects")
    op.drop_table("signal_candidates")
    op.drop_table("articles")
    op.drop_table("job_postings")
    op.drop_table("apprenticeship_openings")
    op.drop_table("institution_offerings")
    op.drop_table("qualifications")
    op.drop_table("institutions")
    op.drop_table("industrial_parks")
    op.drop_table("district_indicators")
    op.drop_table("workforce_aggregates")
    op.drop_table("msme_registrations_monthly")
    op.drop_table("msme_counts")
    op.drop_table("sources")
    op.drop_table("clusters")
    op.drop_table("nco_occupations")
    op.drop_table("nic_codes")
    op.drop_table("places")
    op.drop_table("districts")
    op.drop_table("states")
