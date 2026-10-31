# KaushalSetu (कौशल सेतु) — System Architecture

> **Agentic AI platform detecting emerging industries in Tier-2/3 Indian districts and guiding learners to local jobs.**

---

## 1. High-Level System Architecture

KaushalSetu separates deterministic reference and structured data ingestion from autonomous agent intelligence and human-in-the-loop review.

```mermaid
graph TD
    subgraph Data Layer [Data Ingestion & Grounding Sources]
        OGD["Open Govt Data (OGD) / Udyam"]
        ESHRAM["Ministry of Labour / eShram"]
        SIPCOT["SIPCOT / SIDCO Industrial Land"]
        NQR["National Qualification Register (NQR)"]
        NAPS["Apprenticeship India (NAPS)"]
        NEWS["GDELT & Google News RSS"]
        PIB["Press Information Bureau (PIB)"]
    end

    subgraph Core Platform [FastAPI & SQLAlchemy Engine]
        DB[("PostgreSQL 16 + pgvector + pg_trgm")]
        ROUTER["LLM Router & Guard Gateway"]
        ANALYTICS["Deterministic Analytics Engine"]
    end

    subgraph Agentic Workflows [LangGraph 1.x State Machines]
        GA["Graph A: Signal Discovery"]
        GB["Graph B: Cluster Assessment"]
        GC["Graph C: Skill Mapping"]
        GD["Graph D: Learner Guidance"]
    end

    subgraph User & Admin Interfaces [Next.js 15 Web Application]
        LEARNER["Learner Routes (Equity Toggle)"]
        DISTRICTS["District Intelligence Dashboard"]
        BEHIND["Behind the Data (Telemetry & Runs)"]
        ADMIN["Review Queue & Admin Console"]
    end

    OGD --> DB
    ESHRAM --> DB
    SIPCOT --> DB
    NQR --> DB
    NAPS --> DB

    NEWS --> GA
    PIB --> GA
    GA --> ROUTER
    GA --> DB

    DB --> GB
    ANALYTICS --> GB
    GB --> DB

    DB --> GC
    GC --> DB

    DB --> GD
    ANALYTICS --> GD
    GD --> ROUTER
    GD --> LEARNER

    DB --> DISTRICTS
    GA -.-> BEHIND
    DB --> ADMIN
```

---

## 2. Agent Workflow Graphs

### Graph A — Signal Discovery (`agents/graphs/signal_discovery.py`)
Discovers early industrial investments, capacity expansions, and SEZ developments from public press releases and official gazettes.

```mermaid
flowchart TD
    START([Start Run]) --> PLAN[plan_coverage]
    PLAN --> QUERIES[generate_queries]
    QUERIES --> SEARCH[search_news]
    SEARCH --> TRIAGE[triage_articles]
    TRIAGE --> FETCH[fetch_articles]
    FETCH --> EXTRACT[extract_signals]
    EXTRACT --> GUARD[ground_check_all]
    GUARD --> DEDUPE[merge_and_dedupe]
    DEDUPE --> CONF[score_confidence]
    CONF --> ROUTE{Confidence Score}
    ROUTE -->|Score >= 0.75| PERSIST[persist_signals]
    ROUTE -->|0.45 <= Score < 0.75| REVIEW[queue_human_review]
    ROUTE -->|Score < 0.45| REJECT[discard_signal]
    REVIEW --> PERSIST
    PERSIST --> FINISH([Finalize Run Summary])
    REJECT --> FINISH
```

### Graph B — Cluster Assessment (`agents/graphs/cluster_assessment.py`)
Evaluates cluster momentum, depth, and infrastructure readiness to classify industrial stages and compute demand-supply deficits.

```mermaid
flowchart TD
    START_B([Start District Assessment]) --> GATHER[gather_facts]
    GATHER --> COMPUTE[compute_metrics]
    COMPUTE --> CLASSIFY[classify_stage]
    CLASSIFY --> NARRATE[narrate_cluster]
    NARRATE --> N_GUARD{narrative_guard}
    N_GUARD -->|Valid Citation Tokens| PERSIST_B[persist_assessment]
    N_GUARD -->|Missing / Invalid Citations| TEMPLATE[deterministic_template_fallback]
    TEMPLATE --> PERSIST_B
    PERSIST_B --> END_B([Assessment Complete])
```

### Graph C — Skill Mapping (`agents/graphs/skill_mapping.py`)
Maps identified industrial clusters to standard National Classification of Occupations (NCO-2015) codes, NQR vocational qualifications, and NAPS apprenticeship trades.

```mermaid
flowchart TD
    START_C([Start Skill Mapping]) --> LOAD_C[load_cluster_entities]
    LOAD_C --> MAP_NCO[map_nco_roles]
    MAP_NCO --> EMBED[query_nqr_embeddings]
    EMBED --> LINK_NAPS[link_naps_openings]
    LINK_NAPS --> PERSIST_C[persist_skill_links]
    PERSIST_C --> END_C([Mapping Ready])
```

### Graph D — Learner Guidance (`agents/graphs/learner_guidance.py`)
Translates learner profiles into hyper-local 4-step routes (`Course → Apprenticeship → Employer → Job Role`) with an explicit equity toggle.

```mermaid
flowchart TD
    START_D([Profile Input]) --> PARSE[parse_profile]
    PARSE --> CANDIDATES[candidate_roles]
    CANDIDATES --> RANK[match_and_rank]
    RANK --> PATHWAYS[build_pathways]
    PATHWAYS --> EXPLAIN[explain_routes]
    EXPLAIN --> G_GUARD{guidance_guard}
    G_GUARD -->|Passes Citation & Tone| EMIT[emit_guidance_stream]
    G_GUARD -->|Fails Checks| FALLBACK_EXPLAIN[deterministic_bilingual_explanation]
    FALLBACK_EXPLAIN --> EMIT
    EMIT --> END_D([Stream to UI])
```

---

## 3. Database Entity Relationship (ER) Model

```mermaid
erDiagram
    DISTRICTS ||--o{ PLACES : contains
    DISTRICTS ||--o{ MSME_COUNTS : aggregates
    DISTRICTS ||--o{ WORKFORCE_AGGREGATES : aggregates
    DISTRICTS ||--o{ INDUSTRIAL_PARKS : hosts
    DISTRICTS ||--o{ INSTITUTIONS : hosts
    DISTRICTS ||--o{ PROJECTS : locates
    DISTRICTS ||--o{ CLUSTER_ASSESSMENTS : evaluates

    CLUSTERS ||--o{ PROJECTS : categorizes
    CLUSTERS ||--o{ CLUSTER_ASSESSMENTS : assessed_by

    INSTITUTIONS ||--o{ INSTITUTION_OFFERINGS : provides
    QUALIFICATIONS ||--o{ INSTITUTION_OFFERINGS : qualifies
    QUALIFICATIONS ||--o{ APPRENTICESHIP_OPENINGS : trains_for

    PROJECTS ||--o{ EVIDENCE_SNIPPETS : proven_by
    AGENT_RUNS ||--o{ AGENT_STEPS : logs
    AGENT_RUNS ||--o{ REVIEW_ITEMS : flags
```

---

## 4. Provenance & Hallucination Defenses

1. **Provenances:** Every database row carries a `provenance_label`:
   - `REAL`: Ingested directly from official government APIs or gazettes.
   - `ESTIMATED`: Extracted by verified LLM pipelines with string evidence matching.
   - `MOCK`: Synthetic test fixtures for testing and demo modes.
2. **Grounding Guard (`ground_check`):**
   - RapidFuzz string comparison (`partial_ratio >= 92`) between extracted claim and article source text.
   - Mandatory investment (₹ crore) and job count substring verification.
   - LGD Gazetteer alias resolution (e.g. Hosur → Krishnagiri `582`).
3. **Narrative Guard (`narrative_guard`):**
   - Asserts that every paragraph in cluster narratives includes verified citation tokens (`[P:id]`, `[M:nic]`, `[I:id]`, `[D:indicator]`).
   - Deterministic template fallback triggered if an LLM hallucinates citations.
4. **Privacy & Data Protection:**
   - Worker micro-aggregates in eShram with counts $< 10$ are strictly suppressed.
   - Learner guidance is 100% anonymous; zero personally identifiable information (PII) is persisted.

