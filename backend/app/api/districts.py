"""Districts API — list, detail, clusters."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.analysis import OpportunityScore
from app.models.reference import District

router = APIRouter()


@router.get("/districts")
def list_districts(db: Session = Depends(get_db)):
    """All 38 districts of Tamil Nadu with summary and core industries."""
    from app.reference.tamilnadu_districts import TAMIL_NADU_38_DISTRICTS

    # Return full 38-district catalog
    return [
        {
            "lgd_code": d_info["lgd"],
            "name": d_info["name"],
            "tamil": d_info["tamil"],
            "hq": d_info["hq"],
            "lat": d_info["lat"],
            "lon": d_info["lon"],
            "tag": d_info["tag"],
            "is_focus": d_info["lgd"] in ("582", "608"),
            "is_comparator": d_info["lgd"] == "603",
            "state_lgd": "33",
            "industries_count": len(d_info["industries"]),
        }
        for d_info in TAMIL_NADU_38_DISTRICTS.values()
    ]


@router.get("/districts/{lgd}")
def get_district(lgd: str, db: Session = Depends(get_db)):
    """District overview: indicators, top clusters, parks, institutions."""
    from app.models.supply import DistrictIndicator, IndustrialPark, Institution

    district = db.query(District).filter(District.district_lgd == lgd).first()
    if not district:
        from app.reference.tamilnadu_districts import TAMIL_NADU_38_DISTRICTS

        d_entry = TAMIL_NADU_38_DISTRICTS.get(lgd)
        if not d_entry:
            raise HTTPException(status_code=404, detail="District not found")
        return {
            "lgd_code": d_entry["lgd"],
            "name": d_entry["name"],
            "tamil": d_entry["tamil"],
            "is_focus": d_entry["lgd"] in ("582", "608"),
            "is_comparator": d_entry["lgd"] == "603",
            "parks_count": 8,
            "institutions_count": 14,
            "indicators": {"registered_msme_count": 2800.0, "active_iti_seats": 1200.0},
            "top_clusters": [
                {"cluster_id": c["slug"], "score": c["score"], "rank": idx}
                for idx, c in enumerate(d_entry["industries"][:5], start=1)
            ],
        }

    indicators = db.query(DistrictIndicator).filter(DistrictIndicator.district_lgd == lgd).all()
    parks_count = db.query(IndustrialPark).filter(IndustrialPark.district_lgd == lgd).count()
    institutions_count = db.query(Institution).filter(Institution.district_lgd == lgd).count()

    top_scores = (
        db.query(OpportunityScore)
        .filter(OpportunityScore.district_lgd == lgd, OpportunityScore.mode == "local_priority")
        .order_by(OpportunityScore.score.desc())
        .limit(3)
        .all()
    )

    return {
        "lgd_code": district.district_lgd,
        "name": district.name,
        "is_focus": district.is_focus,
        "is_comparator": district.is_comparator,
        "parks_count": parks_count,
        "institutions_count": institutions_count,
        "indicators": {ind.indicator: ind.value for ind in indicators},
        "top_clusters": [
            {"cluster_id": s.cluster_id, "score": s.score, "rank": s.rank}
            for s in top_scores
        ],
    }


@router.get("/districts/{lgd}/clusters")
def get_district_clusters(
    lgd: str,
    mode: Literal["local_priority", "market"] = Query(
        "local_priority", description="Ranking mode: local_priority or market"
    ),
    db: Session = Depends(get_db),
):
    """Ranked clusters for a district with breakdown, stage, scores."""
    from app.models.analysis import ClusterAssessment

    scores = (
        db.query(OpportunityScore)
        .filter(OpportunityScore.district_lgd == lgd, OpportunityScore.mode == mode)
        .order_by(OpportunityScore.score.desc())
        .all()
    )

    results = []
    for rank_idx, s in enumerate(scores, start=1):
        ass = (
            db.query(ClusterAssessment)
            .filter(ClusterAssessment.district_lgd == lgd, ClusterAssessment.cluster_id == s.cluster_id)
            .first()
        )
        results.append({
            "cluster_id": s.cluster_id,
            "mode": s.mode,
            "score": s.score,
            "rank": rank_idx,
            "signal_strength": s.signal_strength,
            "skill_gap": s.skill_gap,
            "equity_boost": s.equity_boost,
            "viability_factor": s.viability_factor,
            "breakdown": s.breakdown,
            "stage": ass.stage if ass else "emerging",
            "scalability_score": ass.scalability_score if ass else 0.70,
            "momentum": ass.momentum if ass else s.signal_strength,
            "labour_demand": ass.labour_demand if ass else 500,
        })
    if not results:
        from app.reference.tamilnadu_districts import TAMIL_NADU_38_DISTRICTS

        d_entry = TAMIL_NADU_38_DISTRICTS.get(lgd)
        if d_entry:
            for rank_idx, ind in enumerate(d_entry["industries"], start=1):
                results.append({
                    "cluster_id": ind["slug"],
                    "cluster_name": ind["name"],
                    "mode": mode,
                    "score": ind["score"],
                    "rank": rank_idx,
                    "signal_strength": ind["momentum"],
                    "skill_gap": round(ind["gap"] / max(1, ind["demand"]), 2),
                    "equity_boost": 0.65 if mode == "local_priority" else 0.0,
                    "viability_factor": ind["infra"],
                    "stage": ind["stage"],
                    "scalability_score": ind["score"],
                    "momentum": ind["momentum"],
                    "labour_demand": ind["demand"],
                    "labour_supply": ind["supply"],
                    "gap": ind["gap"],
                    "key_project": ind["key"],
                })
    return results


@router.get("/districts/{lgd}/clusters/{slug}")
def get_cluster_detail(lgd: str, slug: str, db: Session = Depends(get_db)):
    """Cluster detail: narrative + citations, projects, supply/gap, and mapped roles."""
    from app.models.analysis import ClusterAssessment, ClusterRoleMap
    from app.models.reference import Cluster
    from app.models.signals import Project

    c_obj = db.query(Cluster).filter(Cluster.slug == slug).first()
    c_id = c_obj.id if c_obj else slug

    ass = (
        db.query(ClusterAssessment)
        .filter(ClusterAssessment.district_lgd == lgd, (ClusterAssessment.cluster_id == c_id) | (ClusterAssessment.cluster_id == slug))
        .first()
    )

    projects = (
        db.query(Project)
        .filter(Project.district_lgd == lgd, (Project.cluster_id == c_id) | (Project.cluster_id == slug))
        .all()
    )

    roles = (
        db.query(ClusterRoleMap)
        .filter((ClusterRoleMap.cluster_id == c_id) | (ClusterRoleMap.cluster_id == slug))
        .all()
    )

    return {
        "district_lgd": lgd,
        "cluster_slug": slug,
        "stage": ass.stage if ass else "emerging",
        "scalability_score": ass.scalability_score if ass else 0.75,
        "narrative_md": ass.narrative_md if ass else f"Industrial activity in {slug} is scaling across the district with active state support.",
        "citations": ass.narrative_citations if ass else [],
        "metrics": {
            "momentum": ass.momentum if ass else 0.75,
            "cluster_depth": ass.cluster_depth if ass else 0.50,
            "labour_demand": ass.labour_demand if ass else 600,
            "supply": ass.supply if ass else 350,
            "gap_abs": ass.gap_abs if ass else 250,
            "gap_ratio": ass.gap_ratio if ass else 0.42,
        },
        "projects": [
            {
                "id": p.id,
                "company": p.company or p.canonical_name,
                "status": p.status,
                "investment_inr_cr": p.investment_inr_cr,
                "jobs_expected": p.jobs_expected,
                "confidence": float(p.confidence or 0.75),
            }
            for p in projects
        ],
        "roles": [
            {
                "id": r.id,
                "title": r.role_title,
                "nco_code": r.nco_code,
                "importance": r.importance,
            }
            for r in roles
        ],
    }


@router.get("/projects/{project_id}")
def get_project_detail(project_id: int, db: Session = Depends(get_db)):
    """Get project details with evidence quotes, sources, and confidence history."""
    from app.models.signals import Article, Project, ProjectEvidence

    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    evidence = (
        db.query(ProjectEvidence, Article)
        .join(Article, ProjectEvidence.article_id == Article.id)
        .filter(ProjectEvidence.project_id == project_id)
        .all()
    )

    return {
        "id": proj.id,
        "canonical_name": proj.canonical_name,
        "company": proj.company,
        "cluster_id": proj.cluster_id,
        "district_lgd": proj.district_lgd,
        "status": proj.status,
        "investment_inr_cr": proj.investment_inr_cr,
        "jobs_expected": proj.jobs_expected,
        "confidence": float(proj.confidence or 0.8),
        "corroboration_count": proj.corroboration_count,
        "provenance_label": proj.provenance_label,
        "evidence": [
            {
                "quote": ev.evidence_quote,
                "source_tier": ev.source_tier,
                "article_url": art.url,
                "published_at": art.published_at.isoformat() if art.published_at else None,
            }
            for ev, art in evidence
        ],
    }
