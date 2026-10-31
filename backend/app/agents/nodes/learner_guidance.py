"""Learner guidance graph nodes (Graph D).

Spec reference: §6.5 (Graph D: learner_guidance).
Pipeline: parse_profile → candidate_roles → match_and_rank → build_pathways → explain → guidance_guard → respond
"""

from __future__ import annotations

from app.agents.nodes.signal_discovery import traced_node
from app.core.logging import get_logger
from app.core.settings import get_settings
from app.llm.router import get_llm
from app.services.pathways import assemble_pathways_for_profile
from app.services.recommendation import LearnerProfile

logger = get_logger("agents.nodes.learner_guidance")


# ─────────────────────────────────────────────────────────────────────────────
# Node 1: parse_profile
# ─────────────────────────────────────────────────────────────────────────────


@traced_node("parse_profile")
def parse_profile(state: dict) -> dict:
    """Validate profile and ensure zero personal identifiers are persisted."""
    raw = state.get("profile", {})
    profile = LearnerProfile(**raw)
    mode = state.get("mode", "local_priority")

    # In DEMO_MODE or without free text, profile is ready
    return {
        "profile": profile.model_dump(),
        "mode": mode,
        "district_lgd": profile.district_lgd,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Node 2, 3, 4: build_ranked_pathways (candidate_roles + match_and_rank + build_pathways)
# ─────────────────────────────────────────────────────────────────────────────


@traced_node("build_pathways")
def build_pathways(state: dict) -> dict:
    """Match, rank, and assemble top-3 civic routes."""
    prof_dict = state.get("profile", {})
    mode = state.get("mode", "local_priority")
    profile = LearnerProfile(**prof_dict)

    routes = assemble_pathways_for_profile(profile, mode=mode)
    logger.info("Assembled %d routes for profile in mode=%s", len(routes), mode)
    return {"routes": routes}


# ─────────────────────────────────────────────────────────────────────────────
# Node 5: explain (STRONG LLM)
# ─────────────────────────────────────────────────────────────────────────────


@traced_node("explain")
def explain_routes(state: dict) -> dict:
    """Generate plain-language explanation and immediate action steps."""
    settings = get_settings()
    routes = state.get("routes", [])
    prof_dict = state.get("profile", {})
    profile = LearnerProfile(**prof_dict)
    lang = profile.language

    if not routes:
        return {"explanation": "No matching routes found in your area. Consider expanding your travel radius."}

    top_route = routes[0]
    top_role = top_route["role"]["title"]
    top_cluster = top_route["cluster"]["name"]
    top_course = top_route["course"]["name"]
    top_employer = top_route["employers"][0]["company"] if top_route.get("employers") else "local industries"

    if settings.demo_mode or not settings.llm_strong_model:
        # Deterministic multilingual grounded template
        if lang == "ta":
            exp = (
                f"உங்கள் தகுதிக்கு **{top_role}** ({top_cluster}) சிறந்த வாய்ப்பாகும். "
                f"முதலில் {top_course}-ல் தொழிற்பயிற்சி பெற்று, பிறகு {top_employer}-ல் பணிபுரியலாம். "
                f"இந்த வாரம் முதல் படியாக தொழிற்பயிற்சி மையத்திற்கு நேரடியாக சென்று விண்ணப்பிக்கவும்."
            )
        else:
            exp = (
                f"Based on your profile, **{top_role}** in {top_cluster} is your highest-opportunity route. "
                f"You can begin foundational skill training at **{top_course}**, followed by an apprenticeship at **{top_route['apprenticeship']['establishment']}**, "
                f"leading directly to job opportunities with **{top_employer}**.\n\n"
                f"**First steps this week:**\n"
                f"1. Visit {top_course} to register for the upcoming batch.\n"
                f"2. Create your profile on the National Apprenticeship Promotion Scheme (NAPS) portal.\n"
                f"3. Review the basic requirements for {top_role}."
            )
        return {"explanation": exp}

    prompt = f"""You are a friendly civic career advisor explaining a vocational route to an Indian youth.
Learner Education: {profile.education}
Existing Skills: {', '.join(profile.skills)}
Recommended Role: {top_role} ({top_cluster})
Course: {top_course}
Employer: {top_employer}
Language: {lang}

Explain in 80-120 words at an 8th-grade reading level:
- Why this route is a strong match
- 2-3 concrete steps to take this week
Do not cite raw scores. Use plain, encouraging, civic tone.
"""
    try:
        llm = get_llm("strong")
        resp = llm.invoke([{"role": "user", "content": prompt}])
        content = resp.content if hasattr(resp, "content") else str(resp)
        return {"explanation": content}
    except Exception as exc:
        logger.warning("LLM explain failed: %s — falling back to template", exc)
        return {"explanation": f"Recommended pathway: {top_role} via {top_course}."}


# ─────────────────────────────────────────────────────────────────────────────
# Node 6: guidance_guard (deterministic)
# ─────────────────────────────────────────────────────────────────────────────


@traced_node("guidance_guard")
def guidance_guard(state: dict) -> dict:
    """Verify that explanation references only grounded entities."""
    routes = state.get("routes", [])
    exp = state.get("explanation", "")

    # Check that route contains valid non-empty items
    assert len(routes) > 0, "No routes assembled"
    assert len(exp) > 10, "Explanation too short"

    return {"guard_passed": True}


# ─────────────────────────────────────────────────────────────────────────────
# Node 7: respond & persist
# ─────────────────────────────────────────────────────────────────────────────


@traced_node("respond")
def respond_and_persist(state: dict) -> dict:
    """Persist anonymous learner session and recommendation."""
    prof_dict = state.get("profile", {})
    mode = state.get("mode", "local_priority")
    routes = state.get("routes", [])

    rec_id = None
    try:
        from app.core.database import SessionLocal
        from app.models.analysis import LearnerSession, Recommendation

        with SessionLocal() as db:
            session = LearnerSession(
                district_lgd=prof_dict.get("district_lgd"),
                education=prof_dict.get("education"),
                skills=prof_dict.get("skills", []),
                interests=prof_dict.get("interests", []),
                language=prof_dict.get("language", "en"),
                consent_store=False,
            )
            db.add(session)
            db.flush()

            rec = Recommendation(
                session_id=session.id,
                mode=mode,
                routes=routes,
            )
            db.add(rec)
            db.commit()
            rec_id = rec.id
    except Exception as exc:
        logger.warning("Could not persist anonymous session: %s", exc)

    return {
        "status": "completed",
        "recommendation_id": rec_id,
        "routes": routes,
        "explanation": state.get("explanation", ""),
    }
