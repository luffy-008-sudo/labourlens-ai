# Labourlens AI (லேபர்லென்ஸ் AI)

> **Autonomous Multi-Agent Workforce Intelligence, Core Industry Routing & Socio-Economic Optimization Engine for Tamil Nadu's 38 Districts.**

[![Next.js](https://img.shields.io/badge/Next.js-15.0.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Neo--Brutalist-F5C518?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Autonomous_Swarm-Active-emerald?style=flat-square)](http://localhost:3000)
[![Coverage](https://img.shields.io/badge/TN_Districts-38%2F38_Synchronized-blue?style=flat-square)](http://localhost:3000/districts)

---

## 🎯 What Labourlens AI Solves

Labourlens AI addresses the **forced urban IT migration trap** where rural and semi-urban engineering/polytechnic/ITI graduates migrate to Chennai or Bengaluru for entry-level BPO/IT jobs (₹22,000–₹25,000/mo), only to lose 70%+ of their income to urban rent, food, and metro commute inflation, leaving `< ₹7,500/mo` net savings.

Labourlens AI transforms districts from talent exporters into self-sustaining GDP engines by:
1. **Running an Autonomous 10-Minute Background Swarm** querying SIPCOT/SIDCO gazettes, NAPS apprenticeships, PSU portals, and private factory job posts.
2. **Parallel 10-Query Fan-Out (50–100 Sources per District)** with automated Map-Reduce synthesis generating strict 4-paragraph analytical conclusions with zero raw link dumps.
3. **Statutory Government & PSU vs. Private Core Role Classifier** comparing official IDA pay scales (Level 8 to E-2 cadres with 43.8% DA + HRA) directly against private factory NAPS stipends and 5-year specialist promotions.
4. **Personalized Resume Skill-Gap Diff Engine** matching candidates' degrees and extracted resume competencies against factory machine shop requirements (DCS, PLC, CNC, HAZOP).
5. **Interactive 6-Month Roadmaps** detailing NSQF Level 4–6 certifications, mandatory safety tickets, and nearby Government ITIs.

---

## 🎨 Swiss Editorial & Neo-Brutalist Design System

Inspired by 1960s Swiss International Typography and modern neo-brutalist architecture:
- **Canvas:** Stark off-white/cream paper canvas (`#F4F4F1`).
- **Framing:** Heavy, crisp black borders (`border-2 border-black`), pill elements (`rounded-full`), and high-impact drop shadows (`shadow-[5px_5px_0px_0px_#000000]`).
- **Signature Accent:** Industrial Swiss gold/yellow (`#F5C518`) interactive CTAs.
- **Readable Scales:** High-legibility typography scale (`text-base` / `text-lg` body copy, `text-3xl` / `text-4xl` metrics) designed for presentation screens and hackathon demos.
- **Bilingual Interface:** Real-time English & Tamil toggle (`EN | தமிழ்`).

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Data Sources [Verified Data Sources]
        SIPCOT["SIPCOT & SIDCO Industrial Parks"]
        NAPS["NAPS National Apprenticeship Portal"]
        PSU["Central/State PSU Gazettes (NLC, BHEL, TANGEDCO)"]
        DGT["DGT & NCVT BharatSkills ITI Directories"]
    end

    subgraph Autonomous Swarm [Autonomous Multi-Agent Swarm]
        CRON["10-Minute Silent Background Daemon"]
        FANOUT["10-Query Parallel Fan-Out (50-100 Sources)"]
        SYNTH["Map-Reduce Analytical Synthesizer"]
    end

    subgraph Intelligence Engine [Labourlens Intelligence Engine]
        REGISTRY["All 38 TN Districts Industrial Registry"]
        CLASSIFIER["Dual-Track Role Classifier (PSU vs Private)"]
        DIFF["Resume Skill-Gap Diff & Take-Home Math"]
    end

    subgraph UI Platform [Neo-Brutalist Web Platform]
        HERO["Hero Section & Live Telemetry"]
        RADAR["38-District Radar & 4-Para Executive Conclusions"]
        ROADMAP["Zero-to-Employed 4-Stage Stepper"]
        PROFILE["Profile Intake & Live Resume Parser"]
    end

    Data Sources --> FANOUT
    CRON --> FANOUT
    FANOUT --> SYNTH
    SYNTH --> REGISTRY
    REGISTRY --> CLASSIFIER
    REGISTRY --> DIFF
    CLASSIFIER --> HERO
    CLASSIFIER --> RADAR
    DIFF --> ROADMAP
    PROFILE --> DIFF
```

---

## ⚡ Quick Start & Run Locally

### 1. Prerequisites
- **Node.js 18+** or **Node.js 20+**
- **npm** or **pnpm**
- **Python 3.11+** (for optional backend agent worker services)

### 2. Frontend Launch
```bash
# Navigate to web application
cd web

# Install dependencies
npm install

# Run production build (compiles 12/12 static & dynamic routes with 0 errors)
npm run build

# Start local production server
npm start -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Application Routes

| Route | Module Description |
| :--- | :--- |
| **`/`** | **Overview & Hero:** 2-column asymmetric hero, live telemetry core, bento feature grid, and interactive role classifier. |
| **`/districts`** | **District Intelligence:** Complete 38 Tamil Nadu districts coverage with 4-paragraph Map-Reduce executive conclusions and live AI analyst. |
| **`/routes`** | **Learner Roadmap:** Interactive skill-gap diff against resume competencies, checkable milestones, and 114 nearby Govt ITIs. |
| **`/profile`** | **Profile & Resume Intake:** Academic stream selector, career preference (Govt, Private, Both), and live resume skill parser. |
| **`/admin`** | **Review Queue & HITL Admin:** Human-in-the-loop review queue for flagged corporate signals and CSV data ingestion. |
| **`/behind-the-data`** | **Agent Console:** Headless browser scraper status, token telemetry, and RapidFuzz quote verification logs. |

---

## 🏛️ Government Open Data License (GODL-India)
All district geographical identifiers, LGD codes, industrial parks, and ITI registry data are compliant with the Government Open Data License (GODL-India). Zero personal identifiable information (PII) is persisted.

© 2026 **Labourlens AI** — Built for Tamil Nadu's next-generation workforce.
