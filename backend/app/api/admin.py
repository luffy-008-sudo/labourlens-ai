"""Admin API — CSV import, review queue, run triggers, source manager."""

from __future__ import annotations

import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.analysis import ReviewItem

router = APIRouter()


@router.post("/admin/import/{table}")
async def import_csv(
    table: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Manual CSV import with schema validation and provenance.

    Supported tables: institutions, qualifications, industrial_parks,
    district_indicators, apprenticeship_openings, policy_tailwinds.
    """
    allowed_tables = {
        "institutions",
        "qualifications",
        "industrial_parks",
        "district_indicators",
        "apprenticeship_openings",
        "policy_tailwinds",
    }
    if table not in allowed_tables:
        raise HTTPException(status_code=400, detail=f"Table '{table}' not allowed for CSV import")

    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    # Validate required provenance columns
    required = {"source_url", "provenance_label"}
    if not required.issubset(set(reader.fieldnames or [])):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must include columns: {required}. Got: {reader.fieldnames}",
        )

    rows = list(reader)
    # TODO: Map rows to ORM models and bulk insert
    return {
        "status": "accepted",
        "table": table,
        "rows_parsed": len(rows),
        "message": f"Parsed {len(rows)} rows for '{table}'. Import processing queued.",
    }


@router.get("/review")
def list_review_items(
    status: str = "pending",
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List review queue items."""
    items = (
        db.query(ReviewItem)
        .filter(ReviewItem.status == status)
        .order_by(ReviewItem.id.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": item.id,
            "kind": item.kind,
            "reason": item.reason,
            "status": item.status,
            "payload": item.payload,
        }
        for item in items
    ]


@router.post("/review/{item_id}/decision")
def decide_review(
    item_id: int,
    action: str,  # approve | edit | reject
    edits: dict | None = None,
    db: Session = Depends(get_db),
):
    """Submit a decision on a review item."""
    item = db.query(ReviewItem).filter(ReviewItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Review item not found")
    if item.status != "pending":
        raise HTTPException(status_code=400, detail="Item already decided")

    if action not in ("approve", "edit", "reject"):
        raise HTTPException(status_code=400, detail="action must be approve|edit|reject")

    item.status = action + "d" if action != "reject" else "rejected"
    if action == "approve":
        item.status = "approved"
    item.decided_at = datetime.utcnow()
    item.decision = {"action": action, "edits": edits}
    db.commit()

    return {"status": "ok", "item_id": item_id, "new_status": item.status}


@router.get("/sources")
def list_sources(db: Session = Depends(get_db)):
    """Source registry with status and licences."""
    from app.models.reference import Source

    sources = db.query(Source).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "base_url": s.base_url,
            "tier": s.tier,
            "status": s.status,
            "licence": s.licence,
        }
        for s in sources
    ]
