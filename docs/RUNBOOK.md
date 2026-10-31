# KaushalSetu — Operations Runbook

> **Operational guidelines for deployment, automated data refresh, live agent execution, evaluation suites, and review queue triage.**

---

## 1. Quick Start & Local Development

### 1.1 Local Demo Mode (Zero External Network Calls)
To demonstrate the full end-to-end platform using pre-seeded fixtures and cached agent executions:

```bash
# Clone and enter directory
cd labourlens

# Set environment
cp .env.example .env

# Start backend in demo mode
make demo
```
The backend initializes SQLite/Postgres with seed reference tables and runs FastAPI on port `8000`.

### 1.2 Frontend Launch
```bash
cd web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access:
- `/` — Learner Guidance with Equity Toggle
- `/districts` — District Intelligence Dashboard
- `/behind-the-data` — Real-time Agent Step Trace & Telemetry
- `/admin` — Review Queue & Operations Console

---

## 2. Running Autonomous Agent Workflows

### 2.1 Signal Discovery Graph (Graph A)
Scrapes, triages, extracts, and ground-checks industrial investment news:

```bash
# Run for a specific district
make run-discovery DISTRICT=Krishnagiri

# Or invoke directly via Python
cd backend
.venv/bin/python -m app.agents.runner --district 582 --cluster ev_auto
```

### 2.2 Triggering via Admin API
```bash
curl -X POST http://localhost:8000/api/v1/runs/signal_discovery \
  -H "Content-Type: application/json" \
  -d '{"district_lgd": "582", "cluster_slug": "ev_auto"}'
```

---

## 3. Human Review Queue Operations

Signals with confidence scores between $0.45$ and $0.75$ or with ambiguous geographic references are automatically paused in the review queue:

1. Navigate to `/admin` on the web interface.
2. Select the **Human Review Queue** tab.
3. Review the side-by-side comparison:
   - Left: Extracted signal payload (Capex ₹ Cr, direct jobs, company).
   - Right: Verbatim source quote and canonical URL.
4. Actions:
   - **Approve:** Promotes signal to `verified` and writes to production database.
   - **Conservative Edit:** Reduces unconfirmed figures (e.g., -20% jobs) before persisting.
   - **Reject:** Discards hallucinated or speculative claims.

API alternative:
```bash
curl -X POST "http://localhost:8000/api/v1/review/101/decision?action=approve"
```

---

## 4. Manual CSV Data Ingestion

When live state APIs are unavailable or under maintenance:

```bash
curl -X POST "http://localhost:8000/api/v1/admin/import/institutions" \
  -F "file=@data/seed/institutions.csv"
```

**Required Headers:** Every uploaded CSV must contain `source_url` and `provenance_label` (`REAL` or `ESTIMATED`).

---

## 5. Running Testing & Evaluation Suites

### 5.1 Unit and Integration Tests
```bash
cd backend
.venv/bin/pytest -v
```

### 5.2 Style and Lint Checks
```bash
cd backend
.venv/bin/ruff check app/ tests/
```

### 5.3 Automated Evaluation Suite
```bash
python -m evals.runner
```
Evaluates:
- Signal extraction precision ($\ge 0.90$) and recall on gold sets.
- Deduplication F1 score ($\ge 0.90$) on labelled article pairs.
- Guidance sanity and equity toggle divergence across 4 benchmark personas.

---

## 6. Incident Triage & Troubleshooting

| Symptom | Cause | Resolution |
|---|---|---|
| `Grounding Check Failed` | Extracted number or claim does not match article source text. | Check `tests/test_signal_discovery.py`. Verify RapidFuzz `partial_ratio >= 92`. |
| `Review Item Blocked` | Unofficial news tier or ambiguous sub-district name. | Resolve via `/admin` queue or inspect alias gazetteer (`app/reference/gazetteer.py`). |
| `SSE Connection Interrupted` | Network timeout during narrative streaming. | Endpoint auto-reconnects; verify backend worker process is active. |

