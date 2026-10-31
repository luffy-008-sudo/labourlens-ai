# KaushalSetu — Data Sources Registry

## Status Legend
- ✅ **live** — Connector built, data flowing
- 🟡 **wip** — Connector in development
- ⬜ **planned** — Not yet started
- 🚫 **blocked** — Needs login/CAPTCHA/key/unreachable. Manual CSV import available.
- 📋 **manual** — Data loaded via CSV upload only

---

## Government Open Data

| # | Source | URL | Licence | Status | Notes |
|---|---|---|---|---|---|
| 1 | data.gov.in — Udyam District Totals | `api.data.gov.in` | GODL-India | ✅ | OGD connector built, ingests to `msme_counts` with verified provenance |
| 2 | data.gov.in — Udyam Unit List (aggregation only) | `api.data.gov.in` | GODL-India | ✅ | In-memory aggregation to `msme_registrations_monthly`. Individual unit PII strictly discarded |
| 3 | data.gov.in — eShram Demographics | `api.data.gov.in` | GODL-India | ✅ | Ingests to `workforce_aggregates`. Cell suppression enforced for counts <10 |
| 4 | NITI Aayog NDAP | `ndap.niti.gov.in` | Gov | ⬜ | May need API key. CSV fallback ready |
| 5 | LGD (Local Government Directory) | `lgdirectory.gov.in` | Gov | ✅ | LGD district codes & gazetteer resolver loaded (`reference/gazetteer.py`) |
| 6 | Tamil Nadu data portal | `tn.data.gov.in` | GODL-India | ⬜ | District indicators |

## Training & Skills

| # | Source | URL | Licence | Status | Notes |
|---|---|---|---|---|---|
| 7 | NCVT MIS (ITI Portal) | `ncvtmis.gov.in` | Public | ⬜ | Selenium scraper needed |
| 8 | NQR (National Qualifications Register) | `nqr.gov.in` | Public read-only | ⬜ | Qualification listings + details |
| 9 | Skill India Digital Hub | `skillindiadigital.gov.in` | Public | ⬜ | No bulk download; district-by-district browsing |
| 10 | Apprenticeship India | `apprenticeshipindia.gov.in` | Public | ⬜ | Openings by location and trade |

## Industrial Parks

| # | Source | URL | Licence | Status | Notes |
|---|---|---|---|---|---|
| 11 | SIPCOT (Tamil Nadu) | `sipcot.tn.gov.in` | Public | ✅ | Ingests Hosur Ph 1&2, Bargur, Thoothukudi, Kovilpatti to `industrial_parks` |
| 12 | India Industrial Land Bank | `iilb.gov.in` | Public | ⬜ | May be unreachable |

## News & Signals

| # | Source | URL | Licence | Status | Notes |
|---|---|---|---|---|---|
| 13 | GDELT DOC 2.0 API | `api.gdeltproject.org` | Free, public | ⬜ | ~3-month lookback, ≤250 records/query, country=IN |
| 14 | Google News RSS | `news.google.com/rss` | Public RSS | ⬜ | `hl=en-IN&gl=IN` for Indian news |
| 15 | PIB RSS | `pib.gov.in` | GODL-India | ⬜ | Press Information Bureau feeds |

## Geolocation

| # | Source | URL | Licence | Status | Notes |
|---|---|---|---|---|---|
| 16 | Google Maps Platform | `maps.googleapis.com` | Commercial (API key) | ⬜ | Places API for ITI geolocation. User to provide API key. |

---

## Manual Import Format

For any blocked source, upload a CSV via `POST /admin/import/{table}` with these required columns:
- All table-specific columns
- `source_url` (use `manual://description` if no URL)
- `provenance_label` (REAL / ESTIMATED / MOCK)
- `method` = `manual`

Documented CSV schemas are in `data/seed/README.md`.
