# KaushalSetu — Design Decisions Log

Every non-obvious choice is logged here with a one-line reason.

---

| # | Decision | Reason |
|---|---|---|
| D1 | **Selenium via `selenium-wire`** instead of Playwright for web scraping | User explicitly requested Selenium; Playwright browser driver has download issues on this system. |
| D2 | **Green + cream palette** from Dribbble ref instead of spec's `#1F5C4A` | User explicitly requested matching the Dribbble shot (forest green `#1B3B32` / `#2C5E4B` + cream `#F4F1EA` / `#FDFBF7`). Spec colours adjusted to match. |
| D3 | **Source Serif 4 + IBM Plex Sans** for typography | Matches the spec's refined editorial feel; pairs well with the green/cream palette. |
| D4 | **Tamil Nadu only** for MVP scope | User confirmed: focus on TN districts, identify early-stage scalable industries. |
| D5 | **Google Maps Platform API** for ITI geolocation | User explicitly requested GMaps for locating ITIs. Will use Places API for search + geocoding. |
| D6 | **Local `bge-m3`** for embeddings default | Multilingual (EN/TA/HI), free, no API dependency. Falls back to provider embeddings if GPU unavailable. |
| D7 | **LangGraph 1.x** for agent orchestration | Explicit stateful graphs match the "LLM step → validator → LLM step" pattern. |
| D8 | **PostgreSQL `pg_trgm`** for fuzzy name matching | Handles Tamil/English spelling variants (Tuticorin/Thoothukudi) without external dependencies. |
| D9 | **Provenance columns on every fact table** | Spec rule: every data row labelled `REAL/ESTIMATED/MOCK` with source URL. Non-negotiable for trust. |
| D10 | **Anonymous learner sessions, 30-day purge** | No PII stored. Privacy by design. |
| D11 | **Config-driven coverage** (`coverage.yaml`) | Adding a district or cluster = config change + re-run, never a code change. |
| D12 | **`DEMO_MODE`** with cached LLM responses | Demo must work offline with no external API calls. |
| D13 | **Read-only tools for chat agents** | No tool can write to DB or call arbitrary URLs. Security boundary. |
| D14 | **Untrusted article wrapper** for prompt injection defence | All fetched text wrapped in `<untrusted_article>` delimiters. Extraction calls have no tools. |
| D15 | **String representation for `district_lgd` and `state_lgd`** | Preserves LGD codes without numeric conversion issues and ensures consistent schema joins across all tables. |
| D16 | **React 18 with Next.js 15 App Router** | Ensures robust, battle-tested compatibility with Recharts charting library without dependency resolution conflicts. |
| D17 | **`TypedDict(total=False)` for LangGraph states** | Enables partial/incremental dictionary returns from nodes while preserving full accumulated run state across all steps. |
| D18 | **Deterministic fallback in narrative guard** | Guaranteed grounding: if an LLM narrative hallucinates external entities or ungrounded citations, the guard replaces it with a verified template narrative. |
