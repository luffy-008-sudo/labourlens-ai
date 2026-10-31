# KaushalSetu — Master Plan

> **कौशल सेतु** — "Skill Bridge"
> Agentic AI platform detecting emerging industries in Tier-2/3 Indian districts and guiding learners to local jobs.

---

## Status Legend
- ⬜ Not started
- 🟡 In progress
- ✅ Done
- 🚫 Blocked

---

## M0 — Scaffold
**Goal:** `docker compose up` brings up db (pgvector + pg_trgm), api (health check), worker, web. CI runs lint + tests.

| # | Task | Status |
|---|---|---|
| 0.1 | Create repo layout (`backend/`, `web/`, `config/`, `data/`, `docs/`) | ✅ |
| 0.2 | `docker-compose.yml` with `db`, `api`, `worker`, `web` services | ✅ |
| 0.3 | PostgreSQL 16 with pgvector + pg_trgm extensions (`scripts/init_db.sql`) | ✅ |
| 0.4 | FastAPI app with `/health` endpoint (`api/health.py`) | ✅ |
| 0.5 | SQLAlchemy 2 + Alembic setup with initial migration (`001_initial_schema.py`) | ✅ |
| 0.6 | Next.js 15 web app with Tailwind + design system tokens + pages | ✅ |
| 0.7 | Worker service skeleton with APScheduler (`worker/scheduler.py`) | ✅ |
| 0.8 | `.env.example`, `Makefile`, `README.md` | ✅ |
| 0.9 | CI config: ruff, mypy, pytest, eslint, typecheck (`.github/workflows/ci.yml`) | ✅ |
| 0.10 | `config/coverage.yaml`, `config/clusters.yaml`, `config/scoring.yaml` | ✅ |
| 0.11 | LLM router (`llm/router.py`) with `get_llm(role)` | ✅ |
| 0.12 | Core settings, logging, DB session factory | ✅ |

**Acceptance:** Scaffold verified, 13 backend unit tests pass, ruff lint clean.

---

## M1 — Reference Data
**Goal:** LGD districts + places for TN. Aliases resolve. Clusters defined with NIC codes.

| # | Task | Status |
|---|---|---|
| 1.1 | Load TN states/districts from LGD exports into `districts` table | ✅ |
| 1.2 | Load sub-districts and towns into `places` (gazetteer) | ✅ |
| 1.3 | Add curated aliases (Tuticorin→Thoothukudi, Hosur→Krishnagiri) | ✅ |
| 1.4 | `resolve_district(text)` function: exact → trigram → places | ✅ |
| 1.5 | Tests for alias resolution (`tests/test_gazetteer.py`) | ✅ |
| 1.6 | `clusters.yaml` with 3 clusters + NIC codes + keywords | ✅ |
| 1.7 | Load NIC-2008, NCO-2015 reference tables (`reference/loader.py`) | ✅ |
| 1.8 | `sources.yaml` with all planned data sources | ✅ |

**Acceptance:** All 6 gazetteer tests pass (Tuticorin, Hosur, Pochampalli, Kovilpatti, Chennai, irrelevant rejection).

---

## M2 — Structured Connectors
**Goal:** Ingest Udyam MSME counts + monthly registrations, eShram workforce aggregates, and district indicators with verified provenance.

| # | Task | Status |
|---|---|---|
| 2.1 | OGD (data.gov.in) API client with retries and rate limiting | ✅ |
| 2.2 | Ingest Udyam counts by NIC2 and enterprise category for TN districts | ✅ |
| 2.3 | Ingest Udyam monthly new registrations time series (in-memory aggregation) | ✅ |
| 2.4 | Ingest eShram district aggregates with suppression for count < 10 | ✅ |
| 2.5 | Load SIPCOT and SIDCO industrial parks with plot availability | ✅ |
| 2.6 | Provenance columns populated on all ingested rows | ✅ |
| 2.7 | Connector tests with cassette fixtures (`tests/test_connectors.py`) | ✅ |

**Acceptance:** All 4 connector tests pass, privacy rules verified (zero unit PII persisted, small counts suppressed).

---

## M3 — Training Supply
**Goal:** Ingest ITIs, polytechnics, PMKVY centres, and NQR qualifications for focus districts.

| # | Task | Status |
|---|---|---|
| 3.1 | Ingest ITIs & polytechnics from NCVT/state portals for Krishnagiri & Thoothukudi | ✅ |
| 3.2 | Ingest NQR qualifications (with NSQF levels, duration, job roles, trade codes) | ✅ |
| 3.3 | Qualification embeddings via `bge-m3` for semantic skill matching | ✅ |
| 3.4 | Ingest NAPS apprenticeship openings | ✅ |
| 3.5 | Admin manual CSV import for fallback when sources are blocked | ✅ |
| 3.6 | Tests for supply ingestion and CSV validator (`tests/test_supply.py`) | ✅ |

**Acceptance:** All 4 supply tests pass; ITIs, qualifications, offerings, and apprenticeships ingested with provenance.

---

## M4 — Signal Discovery Graph
**Goal:** End-to-end run on 2 districts × 3 clusters produces grounded `projects` with evidence. Review interrupt/resume works from the admin API.

| # | Task | Status |
|---|---|---|
| 4.1 | Signal discovery LangGraph graph (`agents/graphs/signal_discovery.py`) | ✅ |
| 4.2 | News & PIB query generation node (`agents/nodes/signal_discovery.py`) | ✅ |
| 4.3 | Relevance triage & article text scraper (`agents/tools/search.py`) | ✅ |
| 4.4 | Grounded information extraction with evidence quote matching (`agents/guards/grounding.py`) | ✅ |
| 4.5 | Deduplication and entity resolution (merging corroborating articles) | ✅ |
| 4.6 | Confidence scoring and human-review interrupt queue | ✅ |
| 4.7 | Tests for signal discovery graph and guards (`tests/test_signal_discovery.py`) | ✅ |

**Acceptance:** All 29 unit and integration tests pass; full pipeline tested in demo mode with zero errors and grounded projects persisted.

---

## M5 — Cluster Assessment & Opportunity Scoring
**Goal:** Pure deterministic scalability and opportunity metrics, stage classification, fact-pack extraction, grounded narrative generation, narrative guard, and sensitivity analysis.

| # | Task | Status |
|---|---|---|
| 5.1 | Pure analytics: Scalability metrics (`analytics/scalability.py`) with percentiles, momentum, maturity, cluster_depth, infra_readiness, policy_tailwind, labour_demand, supply, gap_abs, gap_ratio | ✅ |
| 5.2 | Pure analytics: Opportunity scoring (`analytics/opportunity.py`) for local_priority and market modes, plus weight sensitivity analysis grid | ✅ |
| 5.3 | Cluster assessment graph nodes (`agents/nodes/cluster_assessment.py`): gather_facts, compute_metrics, classify_stage, narrate, narrative_guard, persist | ✅ |
| 5.4 | Cluster assessment LangGraph graph (`agents/graphs/cluster_assessment.py`) | ✅ |
| 5.5 | Unit tests for scalability metrics, opportunity scoring, stage rules, and narrative guard (`tests/test_analytics.py`, `tests/test_assessment.py`) | ✅ |

**Acceptance:** All 17 new tests pass; metrics are 100% deterministic, grounded narratives with citation tokens generated and verified by narrative guard.

---

## M6 — Skill Mapping & Learner Guidance Graphs
**Goal:** Graph C maps clusters to NCO roles & NQR qualifications. Graph D matches anonymous learner profiles to ranked local pathways (Course → Apprenticeship → Employer → Job) with Local Priority toggle and grounded explanations.

| # | Task | Status |
|---|---|---|
| 6.1 | Skill mapping LangGraph graph (`agents/graphs/skill_mapping.py`) + nodes | ✅ |
| 6.2 | Learner matching & ranking engine (`services/recommendation.py`): skill_fit, eligibility, interest_fit, access, and route_score | ✅ |
| 6.3 | Pathway builder (`services/pathways.py`): Course → Apprenticeship → Employer → Job Role | ✅ |
| 6.4 | Learner guidance LangGraph graph (`agents/graphs/learner_guidance.py`) + nodes (parse_profile, candidate_roles, match_and_rank, build_pathways, explain, guidance_guard) | ✅ |
| 6.5 | Tests for skill mapping and learner guidance with equity toggle contract (`tests/test_guidance.py`) | ✅ |

**Acceptance:** All 6 guidance tests pass; verified 4-step pathways assembled and equity toggle contract proven.

---

## M7 — API Endpoints
**Goal:** Production REST and SSE streaming endpoints for districts, clusters, projects, learner guidance, sensitivity analysis, and analyst chat.

| # | Task | Status |
|---|---|---|
| 7.1 | District & Cluster API (`api/districts.py`): `/districts`, `/districts/{lgd}/clusters`, `/districts/{lgd}/clusters/{slug}`, `/projects/{id}` | ✅ |
| 7.2 | Learner Guidance & SSE Streaming (`api/guidance.py`): `POST /guidance`, `GET /pathways/{id}` | ✅ |
| 7.3 | Sensitivity Analysis API (`api/guidance.py`): `GET /analysis/sensitivity` with weight grid perturbation | ✅ |
| 7.4 | Analyst Chat SSE Endpoint (`api/guidance.py`): `POST /chat` with streaming grounded responses | ✅ |
| 7.5 | Agent Runs & Admin Review API (`api/runs.py`, `api/admin.py`): `/runs`, `/runs/{id}`, `/runs/{graph}`, `/review`, `/review/{id}/decision`, `/admin/import/{table}`, `/sources` | ✅ |
| 7.6 | Integration tests for all endpoints (`tests/test_api.py`) | ✅ |

**Acceptance:** All 10 API integration tests pass with 100% route verification and valid JSON/SSE contracts.

---

## M8 — Seed Data & Curated Catalog
**Goal:** Grounded seed datasets labelled REAL, ESTIMATED, or MOCK with official source URLs for focus and comparator districts.

| # | Task | Status |
|---|---|---|
| 8.1 | Training Institutions seed (`data/seed/institutions.csv`) with ITIs, polytechnics, PMKVY centres | ✅ |
| 8.2 | NQR Qualifications seed (`data/seed/qualifications.csv`) with NSQF levels and skills | ✅ |
| 8.3 | Industrial Parks seed (`data/seed/industrial_parks.csv`) with SIPCOT/SIDCO acreages and plots | ✅ |
| 8.4 | District Indicators seed (`data/seed/district_indicators.csv`) with MSME, ITI seats, and capex | ✅ |
| 8.5 | Apprenticeship Openings seed (`data/seed/apprenticeship_openings.csv`) with NAPS listings and stipends | ✅ |
| 8.6 | Industrial Projects seed (`data/seed/projects.csv`) with verbatim evidence quotes and source URLs | ✅ |

**Acceptance:** Complete set of reviewed seed CSVs created with verified provenance labels and source URLs.

---

## M9 — Equity Toggle Verification
**Goal:** Automated contract test asserting that a Tier-2/3 learner persona receives a local cluster route when Local Priority is ON, and switches to a metro role in Market Mode.

| # | Task | Status |
|---|---|---|
| 9.1 | Implement deterministic test `test_equity_toggle_demo_contract` in `tests/test_guidance.py` | ✅ |
| 9.2 | Persona "Diploma · Electrical · Krishnagiri" verified: Top-1 route is local Krishnagiri EV/Auto technician under `local_priority` | ✅ |
| 9.3 | Persona switched to `market` mode: Top-1 route becomes Chennai comparator high-volume IT/Cloud role | ✅ |
| 9.4 | Re-ranking verified with score differential and provenance preservation | ✅ |

**Acceptance:** Contract test passes deterministically without live external API dependencies.

---

## M10 — Next.js Web Application
**Goal:** Production civic web app adhering to "Paper & Ink" design tokens, displaying learner pathways, district intelligence, telemetry, and review console.

| # | Task | Status |
|---|---|---|
| 10.1 | Learner Routes Page (`web/app/page.tsx`): Interactive persona selector, 4-step route timeline, and animated Equity Toggle | ✅ |
| 10.2 | District Intelligence Dashboard (`web/app/districts/page.tsx`): Scalability matrix, demand-supply gap chart, weight sensitivity sliders, and Analyst Chat widget | ✅ |
| 10.3 | Behind the Data Page (`web/app/behind-the-data/page.tsx`): Live agent runs feed, step trace, evidence quote viewer with fuzzy match ratios, hallucination guard audit, and token ledger | ✅ |
| 10.4 | Admin & Review Queue Page (`web/app/admin/page.tsx`): Review queue with approve/edit/reject actions, manual CSV importer with provenance validation, source registry, and agent run triggers | ✅ |
| 10.5 | Navigation & Footer (`web/components/Navbar.tsx`, `web/components/Footer.tsx`) with language selector and branding | ✅ |
| 10.6 | TypeScript and Next.js production build verification | ✅ |

**Acceptance:** `tsc --noEmit` and `next build` pass with 0 errors across all 7 routes. Full test suite (83 tests) and ruff lint pass with 0 errors.
