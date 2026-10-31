"""Skill mapping graph nodes (Graph C).

Spec reference: §6.4 (Graph C: skill_mapping).
Maps cluster → job roles (NCO-2015) → NQR qualifications → skills.
"""

from __future__ import annotations

from typing import Any

from app.agents.nodes.signal_discovery import traced_node
from app.core.logging import get_logger
from app.core.settings import get_clusters_config
from app.services.pathways import MVP_ROLE_CATALOG

logger = get_logger("agents.nodes.skill_mapping")


@traced_node("load_cluster")
def load_cluster(state: dict) -> dict:
    """Load cluster details and keywords."""
    cluster_slug = state.get("cluster_slug", "solar")
    clusters_raw = get_clusters_config().get("clusters", [])
    clusters_cfg = {c["slug"]: c for c in clusters_raw} if isinstance(clusters_raw, list) else clusters_raw
    cdata = clusters_cfg.get(cluster_slug, {})
    return {
        "cluster_name": cdata.get("name", cluster_slug),
        "nic_codes": cdata.get("nic_codes", []),
        "related_trades": cdata.get("related_trades", []),
    }


@traced_node("retrieve_qualifications")
def retrieve_qualifications(state: dict) -> dict:
    """Retrieve qualifications matching cluster trades and keywords."""
    qualifications: list[dict[str, Any]] = []
    try:
        from app.core.database import SessionLocal
        from app.models.supply import Qualification

        with SessionLocal() as db:
            q_list = db.query(Qualification).all()
            for q in q_list:
                qualifications.append({
                    "id": q.id,
                    "title": q.title,
                    "nsqf_level": q.nsqf_level,
                    "sector_skill_council": q.sector_skill_council,
                })
    except Exception as exc:
        logger.warning("DB qualification fetch failed: %s", exc)

    return {"candidate_qualifications": qualifications}


@traced_node("propose_roles")
def propose_roles(state: dict) -> dict:
    """Propose structured roles from MVP catalog or STRONG LLM."""
    c_slug = state.get("cluster_slug", "solar")
    roles = MVP_ROLE_CATALOG.get(c_slug, [])

    proposed: list[dict[str, Any]] = []
    for r in roles:
        proposed.append({
            "role_title": r["title"],
            "nco_code": r["nco_code"],
            "nsqf_level": r["nsqf_level"],
            "key_skills": r["skills"],
            "importance": "core",
            "confidence": 0.95,
            "rationale": f"High demand vocational occupation for {c_slug}.",
        })

    return {"proposed_roles": proposed}


@traced_node("validate_mapping")
def validate_mapping(state: dict) -> dict:
    """Deterministic validation: role titles non-empty, NSQF levels valid."""
    proposed = state.get("proposed_roles", [])
    valid = []
    for r in proposed:
        if r.get("role_title") and 1 <= int(r.get("nsqf_level", 4)) <= 8:
            valid.append(r)

    return {"validated_roles": valid}


@traced_node("persist")
def persist_mapping(state: dict) -> dict:
    """Persist verified roles to cluster_role_map table."""
    c_slug = state.get("cluster_slug", "solar")
    roles = state.get("validated_roles", [])

    persisted = 0
    try:
        from app.core.database import SessionLocal
        from app.models.analysis import ClusterRoleMap
        from app.models.reference import Cluster

        with SessionLocal() as db:
            c_obj = db.query(Cluster).filter(Cluster.slug == c_slug).first()
            c_id = c_obj.id if c_obj else 1

            for r in roles:
                existing = db.query(ClusterRoleMap).filter(
                    ClusterRoleMap.cluster_id == c_id,
                    ClusterRoleMap.role_title == r["role_title"],
                ).first()
                if not existing:
                    entry = ClusterRoleMap(
                        cluster_id=c_id,
                        nco_code=r.get("nco_code"),
                        role_title=r["role_title"],
                        importance=r.get("importance", "core"),
                        confidence=r.get("confidence", 0.9),
                        review_state="approved",
                        rationale=r.get("rationale"),
                    )
                    db.add(entry)
                    persisted += 1
            db.commit()
    except Exception as exc:
        logger.warning("Could not persist cluster role map: %s", exc)

    return {"persisted_count": persisted, "status": "completed"}
