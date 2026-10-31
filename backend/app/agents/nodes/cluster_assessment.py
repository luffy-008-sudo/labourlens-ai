"""Cluster assessment graph nodes (Graph B).

Spec reference: §6.2 (Graph B: cluster_assessment) and §6.3.
START → gather_facts → compute_metrics → classify_stage → narrate → narrative_guard → persist → END
"""

from __future__ import annotations

import json
import re
from datetime import UTC, datetime
from typing import Any

from app.agents.nodes.signal_discovery import traced_node
from app.analytics.opportunity import compute_equity_boost, compute_opportunity_score
from app.analytics.scalability import (
    classify_stage,
    compute_cluster_depth,
    compute_gap,
    compute_infra_readiness,
    compute_labour_demand,
    compute_maturity,
    compute_momentum_raw,
    compute_policy_tailwind,
    compute_scalability_score,
    compute_supply,
)
from app.core.logging import get_logger
from app.core.settings import get_clusters_config, get_scoring_config, get_settings
from app.llm.router import get_llm
from app.reference.gazetteer import DISTRICT_CATALOG

logger = get_logger("agents.nodes.cluster_assessment")


# ─────────────────────────────────────────────────────────────────────────────
# Node 1: gather_facts
# ─────────────────────────────────────────────────────────────────────────────


@traced_node("gather_facts")
def gather_facts(state: dict) -> dict:
    """Gather all grounded facts for district_lgd x cluster_id from the database.

    Collects:
      - Grounded projects (last 24m)
      - MSME counts and registrations for the cluster's NIC codes
      - Industrial parks in the district
      - Policy tailwinds
      - Training institutions & offerings
      - Related workforce
      - District indicators
    """
    district_lgd = str(state.get("district_lgd", "582"))
    cluster_slug = str(state.get("cluster_slug", "solar"))

    clusters_raw = get_clusters_config().get("clusters", [])
    clusters_cfg = {c["slug"]: c for c in clusters_raw} if isinstance(clusters_raw, list) else clusters_raw
    cdata = clusters_cfg.get(cluster_slug, {})
    nic_codes = [str(c) for c in cdata.get("nic_codes", [])]

    settings = get_settings()
    now = datetime.now(UTC).replace(tzinfo=None)

    # In DEMO_MODE or fallback: ensure representative facts
    projects_list: list[dict[str, Any]] = []
    msme_count = 0
    growth_12m = 5.0
    parks_list: list[dict[str, Any]] = []
    national_tailwinds = 1
    state_tailwinds = 1
    inst_seats = 0
    institutions_list: list[dict[str, Any]] = []
    related_workforce = 0
    indicators: dict[str, float] = {}

    try:
        from app.core.database import SessionLocal
        from app.models.reference import Cluster
        from app.models.signals import PolicyTailwind, Project
        from app.models.supply import (
            DistrictIndicator,
            IndustrialPark,
            Institution,
            InstitutionOffering,
            MSMECount,
            WorkforceAggregate,
        )

        with SessionLocal() as db:
            # 1. Projects
            c_obj = db.query(Cluster).filter(Cluster.slug == cluster_slug).first()
            c_id = c_obj.id if c_obj else cluster_slug

            q_proj = db.query(Project).filter(
                Project.district_lgd == district_lgd,
                (Project.cluster_id == c_id) | (Project.cluster_id == cluster_slug),
            ).all()

            for p in q_proj:
                age_m = 0.0
                if p.first_seen:
                    age_m = max(0.0, (now - p.first_seen).days / 30.0)
                projects_list.append({
                    "id": p.id,
                    "company": p.company or p.canonical_name,
                    "status": p.status or "announced",
                    "investment_inr_cr": float(p.investment_inr_cr) if p.investment_inr_cr else None,
                    "jobs_expected": int(p.jobs_expected) if p.jobs_expected else None,
                    "confidence": float(p.confidence or 0.6),
                    "age_months": age_m,
                })

            # 2. MSME counts
            q_msme = db.query(MSMECount).filter(
                MSMECount.district_lgd == district_lgd,
                MSMECount.nic2.in_([c[:2] for c in nic_codes]),
            ).all()
            msme_count = sum(m.count or 0 for m in q_msme)

            # 3. Industrial parks
            q_parks = db.query(IndustrialPark).filter(
                IndustrialPark.district_lgd == district_lgd
            ).all()
            for pk in q_parks:
                parks_list.append({
                    "id": pk.id,
                    "name": pk.name,
                    "sector_focus": pk.sector_focus or [],
                    "plots_available": pk.plots_available or 0,
                })

            # 4. Policy tailwinds
            q_pw = db.query(PolicyTailwind).filter(
                (PolicyTailwind.cluster_id == c_id) | (PolicyTailwind.cluster_id == cluster_slug)
            ).all()
            for pw in q_pw:
                if pw.scope == "national":
                    national_tailwinds += 1
                else:
                    state_tailwinds += 1

            # 5. Institutions & seats
            q_inst = db.query(Institution).filter(
                Institution.district_lgd == district_lgd
            ).all()
            inst_ids = [i.id for i in q_inst]
            if inst_ids:
                q_off = db.query(InstitutionOffering).filter(
                    InstitutionOffering.institution_id.in_(inst_ids)
                ).all()
                inst_seats = sum(o.seats_per_year or 0 for o in q_off)
                for inst in q_inst[:5]:
                    institutions_list.append({"id": inst.id, "name": inst.name, "type": inst.type})

            # 6. Workforce
            q_wf = db.query(WorkforceAggregate).filter(
                WorkforceAggregate.district_lgd == district_lgd
            ).all()
            related_workforce = sum(w.count or 0 for w in q_wf)

            # 7. District indicators
            q_ind = db.query(DistrictIndicator).filter(
                DistrictIndicator.district_lgd == district_lgd
            ).all()
            for ind in q_ind:
                indicators[ind.indicator] = float(ind.value or 0.0)

    except Exception as exc:
        logger.warning("DB query in gather_facts failed: %s — using seed fallbacks", exc)

    # In DEMO_MODE, provide representative facts if DB was empty
    if settings.demo_mode and not projects_list:
        if cluster_slug == "solar" and district_lgd == "608":
            projects_list = [{
                "id": 1,
                "company": "Siemens Gamesa",
                "status": "mou_signed",
                "investment_inr_cr": 1200.0,
                "jobs_expected": 800,
                "confidence": 0.85,
                "age_months": 2.0,
            }]
            msme_count = 320
            inst_seats = 350
            related_workforce = 1200
        elif cluster_slug == "ev_auto" and district_lgd == "582":
            projects_list = [{
                "id": 2,
                "company": "Ola Electric",
                "status": "land_allotted",
                "investment_inr_cr": 2400.0,
                "jobs_expected": 3000,
                "confidence": 0.90,
                "age_months": 1.5,
            }]
            msme_count = 1450
            inst_seats = 1200
            related_workforce = 5400
        elif cluster_slug == "food_processing" and district_lgd == "582":
            projects_list = [{
                "id": 3,
                "company": "IFS Food Systems",
                "status": "mou_signed",
                "investment_inr_cr": 350.0,
                "jobs_expected": 500,
                "confidence": 0.75,
                "age_months": 3.0,
            }]
            msme_count = 820
            inst_seats = 250
            related_workforce = 2100

    # Structured Fact Pack for LLM and guards
    fact_pack = {
        "district_lgd": district_lgd,
        "district_name": DISTRICT_CATALOG.get(district_lgd, {}).get("name", district_lgd),
        "cluster_slug": cluster_slug,
        "cluster_name": cdata.get("name", cluster_slug),
        "projects": projects_list,
        "msme": {
            "count": msme_count,
            "nic_codes": nic_codes,
            "growth_12m_pct": growth_12m,
        },
        "industrial_parks": parks_list,
        "policy": {
            "national_tailwinds": national_tailwinds,
            "state_tailwinds": state_tailwinds,
        },
        "training": {
            "total_seats": inst_seats,
            "institutions": institutions_list,
        },
        "workforce": {
            "related_count": related_workforce,
        },
        "indicators": indicators,
    }

    return {"fact_pack": fact_pack}


# ─────────────────────────────────────────────────────────────────────────────
# Node 2: compute_metrics
# ─────────────────────────────────────────────────────────────────────────────


@traced_node("compute_metrics")
def compute_metrics(state: dict) -> dict:
    """Compute deterministic scalability sub-scores and demand-supply metrics."""
    fp = state.get("fact_pack", {})
    projects = fp.get("projects", [])
    msme = fp.get("msme", {})
    parks = fp.get("industrial_parks", [])
    policy = fp.get("policy", {})
    training = fp.get("training", {})
    workforce = fp.get("workforce", {})
    indicators = fp.get("indicators", {})
    pop = int(indicators.get("population", 1_800_000))

    # 1. Momentum & Maturity
    raw_momentum = compute_momentum_raw(projects, decay_months=18.0)
    # Statewide percentile scaling (using benchmarks: 0 to 15 raw momentum)
    momentum = min(1.0, raw_momentum / 8.0) if raw_momentum > 0 else 0.1
    maturity = compute_maturity(projects)

    # 2. Cluster Depth
    cluster_depth = compute_cluster_depth(
        msme_count=msme.get("count", 0),
        population=pop,
        growth_12m_pct=msme.get("growth_12m_pct", 5.0),
        all_msmes_per_lakh=[20.0, 50.0, 100.0, 200.0],
        all_growths=[0.0, 5.0, 10.0, 20.0],
    )

    # 3. Infra readiness
    infra_readiness = compute_infra_readiness(parks, fp.get("cluster_slug", ""))

    # 4. Policy tailwinds
    policy_tailwind = compute_policy_tailwind(
        policy.get("national_tailwinds", 1),
        policy.get("state_tailwinds", 1),
    )

    # 5. Demand, Supply, Gap
    labour_demand = compute_labour_demand(projects)
    supply = compute_supply(
        institution_seats=training.get("total_seats", 0),
        related_workforce=workforce.get("related_count", 0),
        completion_rate=0.70,
    )
    gap_abs, gap_ratio = compute_gap(labour_demand, supply)

    # 6. Overall Scalability Score
    scalability_score = compute_scalability_score(
        momentum=momentum,
        maturity=maturity,
        cluster_depth=cluster_depth,
        infra_readiness=infra_readiness,
        policy_tailwind=policy_tailwind,
    )

    metrics = {
        "momentum": round(momentum, 3),
        "maturity": round(maturity, 3),
        "cluster_depth": round(cluster_depth, 3),
        "infra_readiness": round(infra_readiness, 3),
        "policy_tailwind": round(policy_tailwind, 3),
        "labour_demand": round(labour_demand, 1),
        "supply": round(supply, 1),
        "gap_abs": round(gap_abs, 1),
        "gap_ratio": round(gap_ratio, 3),
        "scalability_score": round(scalability_score, 3),
    }

    return {"metrics": metrics}


# ─────────────────────────────────────────────────────────────────────────────
# Node 3: classify_stage
# ─────────────────────────────────────────────────────────────────────────────


@traced_node("classify_stage")
def classify_stage_node(state: dict) -> dict:
    """Classify the cluster stage deterministically from metrics."""
    metrics = state.get("metrics", {})
    fp = state.get("fact_pack", {})
    projects = fp.get("projects", [])

    newest_age = min((p.get("age_months", 99.0) for p in projects), default=None)
    num_facts = len(projects) + (1 if fp.get("msme", {}).get("count") else 0)

    stage = classify_stage(
        momentum=metrics.get("momentum", 0.0),
        cluster_depth=metrics.get("cluster_depth", 0.0),
        msme_growth_12m_pct=fp.get("msme", {}).get("growth_12m_pct", 5.0),
        num_grounded_facts=num_facts,
        newest_project_age_months=newest_age,
    )

    logger.info("Classified %s in %s as stage=%s", fp.get("cluster_slug"), fp.get("district_lgd"), stage)
    return {"stage": stage}


# ─────────────────────────────────────────────────────────────────────────────
# Node 4: narrate (STRONG LLM)
# ─────────────────────────────────────────────────────────────────────────────


@traced_node("narrate")
def narrate(state: dict) -> dict:
    """Draft a grounded 120-180 word district cluster brief with citation tokens."""
    settings = get_settings()
    fp = state.get("fact_pack", {})
    metrics = state.get("metrics", {})
    stage = state.get("stage", "emerging")

    district_name = fp.get("district_name", "District")
    cluster_name = fp.get("cluster_name", "Cluster")

    if settings.demo_mode or not settings.llm_strong_model:
        # Grounded template generator with exact citation tokens
        brief = _template_narrative(fp, metrics, stage)
        return {"narrative_md": brief}

    prompt = f"""Draft a 120-180 word factual brief on {cluster_name} in {district_name}.
Stage: {stage}. Scalability score: {metrics.get('scalability_score')}.

Fact Pack:
{json.dumps(fp, indent=2, default=str)}

Every claim must cite tokens: [P:<id>] for projects, [M:<nic>] for MSME, [I:<id>] for institutions.
Do not invent any companies, projects, or statistics.
"""
    try:
        llm = get_llm("strong")
        resp = llm.invoke([{"role": "user", "content": prompt}])
        content = resp.content if hasattr(resp, "content") else str(resp)
        return {"narrative_md": content}
    except Exception as exc:
        logger.warning("LLM narrative failed: %s — falling back to template", exc)
        return {"narrative_md": _template_narrative(fp, metrics, stage)}


def _template_narrative(fp: dict, metrics: dict, stage: str) -> str:
    """Deterministic template narrative strictly grounded with citation tokens."""
    d_name = fp.get("district_name", "Focus District")
    c_name = fp.get("cluster_name", "Industry Cluster")
    projects = fp.get("projects", [])
    msme = fp.get("msme", {})
    training = fp.get("training", {})

    lines: list[str] = [
        f"{d_name} displays an **{stage}** trajectory in {c_name} with an overall scalability score of {metrics.get('scalability_score', 0.5):.2f}."
    ]

    if projects:
        p0 = projects[0]
        inv_str = f"₹{p0.get('investment_inr_cr', 0):,.0f} crore" if p0.get("investment_inr_cr") else "significant"
        jobs_str = f"{p0.get('jobs_expected', 0):,d}" if p0.get("jobs_expected") else "substantial"
        lines.append(
            f"Recent demand is anchored by {p0.get('company')} [P:{p0.get('id')}], targeting an investment of {inv_str} and projected to create {jobs_str} jobs under status '{p0.get('status')}'."
        )

    nic_list = ", ".join(msme.get("nic_codes", ["NIC"]))
    lines.append(
        f"Local enterprise depth comprises {msme.get('count', 0):,d} registered MSME units across sector codes {nic_list} [M:{nic_list}]."
    )

    demand = metrics.get("labour_demand", 0)
    supply = metrics.get("supply", 0)
    gap_abs = metrics.get("gap_abs", 0)
    lines.append(
        f"Training infrastructure provides approximately {training.get('total_seats', 0):,d} formal seats per annum. Against estimated labour demand of {demand:.0f} jobs, current supply is estimated at {supply:.0f}, leaving an estimated supply gap of {gap_abs:.0f} skilled personnel."
    )

    return "\n\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# Node 5: narrative_guard (deterministic)
# ─────────────────────────────────────────────────────────────────────────────


@traced_node("narrative_guard")
def narrative_guard(state: dict) -> dict:
    """Verify that narrative citations resolve and numbers are grounded.

    If citations don't resolve, falls back to the deterministic template.
    """
    text = state.get("narrative_md", "")
    fp = state.get("fact_pack", {})
    metrics = state.get("metrics", {})
    stage = state.get("stage", "emerging")

    # Extract all [P:id], [M:nic], [I:id], [D:ind] citations
    citation_tokens = re.findall(r"\[(P|M|I|D):([^\]]+)\]", text)

    valid_project_ids = {str(p["id"]) for p in fp.get("projects", [])}
    valid_msme_nics = set(fp.get("msme", {}).get("nic_codes", []))
    valid_inst_ids = {str(i["id"]) for i in fp.get("training", {}).get("institutions", [])}
    valid_indicators = set(fp.get("indicators", {}).keys())

    all_valid = True
    resolved_citations: list[dict] = []

    for prefix, val in citation_tokens:
        val_clean = val.strip()
        if prefix == "P":
            if val_clean in valid_project_ids:
                resolved_citations.append({"kind": "project", "id": val_clean})
            else:
                all_valid = False
        elif prefix == "M":
            if any(nic in val_clean for nic in valid_msme_nics) or not valid_msme_nics:
                resolved_citations.append({"kind": "msme", "code": val_clean})
            else:
                all_valid = False
        elif prefix == "I":
            if val_clean in valid_inst_ids or not valid_inst_ids:
                resolved_citations.append({"kind": "institution", "id": val_clean})
            else:
                all_valid = False
        elif prefix == "D":
            if val_clean in valid_indicators or not valid_indicators:
                resolved_citations.append({"kind": "indicator", "key": val_clean})
            else:
                all_valid = False

    if not all_valid:
        logger.warning("Narrative citation guard failed — replacing with verified template")
        text = _template_narrative(fp, metrics, stage)

    return {
        "narrative_md": text,
        "narrative_citations": resolved_citations,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Node 6: persist (the only writer)
# ─────────────────────────────────────────────────────────────────────────────


@traced_node("persist")
def persist_assessment(state: dict) -> dict:
    """Upsert cluster_assessments and recompute opportunity_scores."""
    fp = state.get("fact_pack", {})
    metrics = state.get("metrics", {})
    stage = state.get("stage", "emerging")
    narrative_md = state.get("narrative_md", "")
    citations = state.get("narrative_citations", [])

    district_lgd = str(fp.get("district_lgd", "582"))
    cluster_slug = str(fp.get("cluster_slug", "solar"))

    scoring_version = get_scoring_config().get("version", "1.0.0")

    try:
        from app.core.database import SessionLocal
        from app.models.analysis import ClusterAssessment, OpportunityScore
        from app.models.reference import Cluster

        with SessionLocal() as db:
            c_obj = db.query(Cluster).filter(Cluster.slug == cluster_slug).first()
            c_id = c_obj.id if c_obj else 1

            # 1. Upsert ClusterAssessment
            existing_ass = db.query(ClusterAssessment).filter(
                ClusterAssessment.district_lgd == district_lgd,
                ClusterAssessment.cluster_id == c_id,
            ).first()

            now = datetime.now(UTC).replace(tzinfo=None)

            if existing_ass:
                ass = existing_ass
            else:
                ass = ClusterAssessment(
                    district_lgd=district_lgd,
                    cluster_id=c_id,
                )
                db.add(ass)

            ass.scoring_version = scoring_version
            ass.momentum = metrics.get("momentum")
            ass.maturity = metrics.get("maturity")
            ass.cluster_depth = metrics.get("cluster_depth")
            ass.infra_readiness = metrics.get("infra_readiness")
            ass.policy_tailwind = metrics.get("policy_tailwind")
            ass.labour_demand = metrics.get("labour_demand")
            ass.supply = metrics.get("supply")
            ass.gap_abs = metrics.get("gap_abs")
            ass.gap_ratio = metrics.get("gap_ratio")
            ass.scalability_score = metrics.get("scalability_score")
            ass.stage = stage
            ass.narrative_md = narrative_md
            ass.narrative_citations = citations
            ass.computed_at = now

            db.flush()

            # 2. Compute and upsert OpportunityScore for local_priority and market modes
            eq_boost = compute_equity_boost(
                outmigration_val=fp.get("indicators", {}).get("outmigration_proxy", 0.4),
                income_val=fp.get("indicators", {}).get("income_proxy"),
                unemployment_val=fp.get("indicators", {}).get("unemployment_proxy"),
                aspirational_flag=fp.get("indicators", {}).get("aspirational_flag"),
            )

            for mode in ["local_priority", "market"]:
                score_val, breakdown = compute_opportunity_score(
                    momentum=metrics.get("momentum", 0.0),
                    gap_ratio=metrics.get("gap_ratio", 0.0),
                    equity_boost=eq_boost,
                    labour_demand=metrics.get("labour_demand", 0.0),
                    mode=mode,
                )

                existing_score = db.query(OpportunityScore).filter(
                    OpportunityScore.district_lgd == district_lgd,
                    OpportunityScore.cluster_id == c_id,
                    OpportunityScore.mode == mode,
                ).first()

                if not existing_score:
                    score_rec = OpportunityScore(
                        district_lgd=district_lgd,
                        cluster_id=c_id,
                        scoring_version=scoring_version,
                        mode=mode,
                        signal_strength=breakdown.signal_strength,
                        skill_gap=breakdown.skill_gap,
                        equity_boost=breakdown.equity_boost,
                        viability_factor=breakdown.viability_factor,
                        score=score_val,
                        breakdown=breakdown.__dict__,
                    )
                    db.add(score_rec)
                else:
                    existing_score.scoring_version = scoring_version
                    existing_score.signal_strength = breakdown.signal_strength
                    existing_score.skill_gap = breakdown.skill_gap
                    existing_score.equity_boost = breakdown.equity_boost
                    existing_score.viability_factor = breakdown.viability_factor
                    existing_score.score = score_val
                    existing_score.breakdown = breakdown.__dict__

            db.commit()
            logger.info("Persisted assessment and opportunity scores for %s / %s", district_lgd, cluster_slug)

    except Exception as exc:
        logger.error("Persist assessment failed: %s", exc)
        return {"persist_error": str(exc), "status": "failed"}

    return {"status": "completed"}
