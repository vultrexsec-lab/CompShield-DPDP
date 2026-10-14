
"""Public Data Principal portal — no JWT. DPDP rights self-service."""
from datetime import datetime, timezone, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.models.entities import DSARRequest, ConsentRecord
from app.models.more_entities import Notification
from app.models.user import Organization

router = APIRouter(prefix="/public", tags=["Public Portal"])


def _gen_request_id(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    count = db.query(DSARRequest).count() + 1
    return f"DSAR-{year}-{count:04d}"


class PublicDsarIn(BaseModel):
    request_type: str = Field(..., description="access | erasure | correction | portability | restriction")
    principal_name: str
    principal_email: EmailStr
    principal_phone: Optional[str] = None
    description: Optional[str] = None
    organization_slug: Optional[str] = "default"


class TrackIn(BaseModel):
    request_id: str
    principal_email: EmailStr


class ConsentLookupIn(BaseModel):
    principal_email: EmailStr
    organization_slug: Optional[str] = "default"


@router.get("/health")
def public_health():
    return {"status": "ok", "portal": "data-principal-rights"}


@router.post("/dsar", status_code=201)
def public_submit_dsar(body: PublicDsarIn, db: Session = Depends(get_db)):
    """Data principal submits a rights request without login."""
    allowed = {"access", "erasure", "correction", "portability", "restriction"}
    if body.request_type not in allowed:
        raise HTTPException(400, f"request_type must be one of {allowed}")

    org_id = None
    org = db.query(Organization).first()
    if org:
        org_id = org.id

    # Apply approval rules for erasure
    status_val = "pending"
    approval_status = "not_required"
    required_levels = 0
    priority = "medium"
    if body.request_type in ("erasure", "restriction"):
        approval_status = "pending_approval"
        required_levels = 2 if body.request_type == "erasure" else 1
        status_val = "pending_approval"
        priority = "high"

    item = DSARRequest(
        request_id=_gen_request_id(db),
        request_type=body.request_type,
        status=status_val,
        principal_name=body.principal_name,
        principal_email=body.principal_email.lower(),
        principal_phone=body.principal_phone,
        description=body.description or f"Submitted via public portal — {body.request_type}",
        due_date=date.today() + timedelta(days=30),
        organization_id=org_id,
        priority=priority,
        approval_status=approval_status,
        required_approval_levels=required_levels,
        current_approval_level=0,
    )
    db.add(item)
    db.flush()
    db.add(
        Notification(
            title=f"Portal DSAR {item.request_id}",
            message=f"{body.request_type} from {body.principal_name} ({body.principal_email})",
            type="info",
            link="/dashboard/dsar",
            organization_id=org_id,
        )
    )
    db.commit()
    db.refresh(item)
    return {
        "request_id": item.request_id,
        "status": item.status,
        "request_type": item.request_type,
        "due_date": str(item.due_date) if item.due_date else None,
        "message": "Request received. Save your Request ID to track status.",
        "track_hint": "Use /portal/track with request_id + email",
    }


@router.post("/dsar/track")
def public_track_dsar(body: TrackIn, db: Session = Depends(get_db)):
    """Track request status — must match email + request_id."""
    item = (
        db.query(DSARRequest)
        .filter(
            DSARRequest.request_id == body.request_id.strip(),
            DSARRequest.principal_email == body.principal_email.lower(),
        )
        .first()
    )
    if not item:
        raise HTTPException(404, "No request found for this ID and email")
    return {
        "request_id": item.request_id,
        "request_type": item.request_type,
        "status": item.status,
        "approval_status": getattr(item, "approval_status", None),
        "priority": getattr(item, "priority", None),
        "due_date": str(item.due_date) if item.due_date else None,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
        "description": item.description,
    }


@router.post("/consent/lookup")
def public_consent_lookup(body: ConsentLookupIn, db: Session = Depends(get_db)):
    """List active/withdrawn consents for an email (no login)."""
    rows = (
        db.query(ConsentRecord)
        .filter(ConsentRecord.principal_email == body.principal_email.lower())
        .order_by(ConsentRecord.created_at.desc())
        .limit(50)
        .all()
    )
    return {
        "email": body.principal_email.lower(),
        "count": len(rows),
        "consents": [
            {
                "purpose": r.purpose,
                "channel": r.channel,
                "status": r.status,
                "given_at": r.given_at.isoformat() if r.given_at else None,
                "withdrawn_at": r.withdrawn_at.isoformat() if r.withdrawn_at else None,
                "notice_version": r.notice_version,
            }
            for r in rows
        ],
    }


@router.post("/consent/withdraw")
def public_consent_withdraw(
    principal_email: EmailStr,
    purpose: str,
    db: Session = Depends(get_db),
):
    """Public withdraw by email + purpose (as easy as grant — DPDP)."""
    from app.api.consent import withdraw_consent
    item = (
        db.query(ConsentRecord)
        .filter(
            ConsentRecord.principal_email == principal_email.lower(),
            ConsentRecord.purpose == purpose,
            ConsentRecord.status == "active",
        )
        .order_by(ConsentRecord.id.desc())
        .first()
    )
    if not item:
        raise HTTPException(404, "No active consent found for this email and purpose")
    # Minimal user stub for withdraw_consent internals — call logic inline
    from app.models.more_entities import ConsentArtifact, Vendor, PurposeMapping, Notification as Notif
    import hashlib, json

    item.status = "withdrawn"
    item.withdrawn_at = datetime.now(timezone.utc)

    def sha(t):
        return hashlib.sha256(t.encode()).hexdigest()

    prev = None
    last = db.query(ConsentArtifact).order_by(ConsentArtifact.id.desc()).first()
    if last:
        prev = last.artifact_hash
    payload = {"email": item.principal_email, "purpose": purpose, "source": "public_portal"}
    body_j = json.dumps({"event": "withdrawn", "payload": payload, "prev": prev, "ts": datetime.now(timezone.utc).isoformat()}, sort_keys=True)
    h = sha(body_j)
    db.add(
        ConsentArtifact(
            consent_id=item.id,
            event_type="withdrawn",
            principal_email=item.principal_email,
            purpose=item.purpose,
            payload=json.dumps(payload),
            artifact_hash=h,
            prev_hash=prev,
            organization_id=item.organization_id,
        )
    )
    item.revoke_hash = h
    db.add(
        Notif(
            title=f"Public portal: consent withdrawn — {purpose}",
            message=f"{principal_email} withdrew via Data Principal portal",
            type="warning",
            link="/dashboard/consent",
            organization_id=item.organization_id,
        )
    )
    db.commit()
    return {"status": "withdrawn", "purpose": purpose, "message": "Consent withdrawn successfully"}
