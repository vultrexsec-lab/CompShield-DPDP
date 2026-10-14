
import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.entities import ConsentRecord
from app.models.more_entities import ConsentArtifact, Notification, Vendor, PurposeMapping
from app.schemas.entities import ConsentCreate, ConsentUpdate, ConsentResponse

router = APIRouter(prefix="/consent", tags=["Consent"])


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _last_hash(db: Session, org_id) -> Optional[str]:
    q = db.query(ConsentArtifact).order_by(ConsentArtifact.id.desc())
    if org_id:
        q = q.filter(ConsentArtifact.organization_id == org_id)
    last = q.first()
    return last.artifact_hash if last else None


def _write_artifact(
    db: Session,
    *,
    consent_id: int | None,
    event_type: str,
    principal_email: str,
    purpose: str,
    payload: dict,
    org_id,
    vendors_notified: str | None = None,
) -> ConsentArtifact:
    prev = _last_hash(db, org_id)
    body = {
        "event": event_type,
        "consent_id": consent_id,
        "email": principal_email,
        "purpose": purpose,
        "payload": payload,
        "prev_hash": prev,
        "ts": datetime.now(timezone.utc).isoformat(),
    }
    h = _sha256(json.dumps(body, sort_keys=True, default=str))
    art = ConsentArtifact(
        consent_id=consent_id,
        event_type=event_type,
        principal_email=principal_email,
        purpose=purpose,
        payload=json.dumps(payload, default=str),
        artifact_hash=h,
        prev_hash=prev,
        vendors_notified=vendors_notified,
        organization_id=org_id,
    )
    db.add(art)
    return art


def _vendors_for_purpose(db: Session, purpose: str, org_id) -> list:
    """Find vendors linked to this purpose (vendor.purposes or PurposeMapping)."""
    names = set()
    q = db.query(Vendor)
    if org_id:
        q = q.filter(Vendor.organization_id == org_id)
    for v in q.all():
        purposes = (v.purposes or "") + "," + (v.category or "") + "," + (v.vendor_type or "")
        if purpose.lower() in purposes.lower() or any(
            p.strip().lower() in purpose.lower() for p in purposes.split(",") if p.strip()
        ):
            names.add(v.name)
    pq = db.query(PurposeMapping)
    if org_id:
        pq = pq.filter(PurposeMapping.organization_id == org_id)
    for pm in pq.all():
        if pm.purpose_name and (
            purpose.lower() in pm.purpose_name.lower()
            or pm.purpose_name.lower() in purpose.lower()
        ):
            if pm.vendor_names:
                for n in pm.vendor_names.split(","):
                    if n.strip():
                        names.add(n.strip())
    return sorted(names)


@router.get("", response_model=List[ConsentResponse])
def list_consents(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(ConsentRecord)
    if current_user.organization_id:
        q = q.filter(ConsentRecord.organization_id == current_user.organization_id)
    if status_filter:
        q = q.filter(ConsentRecord.status == status_filter)
    return q.order_by(ConsentRecord.created_at.desc()).all()


@router.post("", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED)
def create_consent(
    payload: ConsentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = ConsentRecord(
        principal_name=payload.principal_name,
        principal_email=payload.principal_email.lower(),
        purpose=payload.purpose,
        channel=payload.channel,
        status="active",
        notice_version=payload.notice_version or "v1.0",
        language=getattr(payload, "language", None) or "en",
        organization_id=current_user.organization_id,
    )
    db.add(item)
    db.flush()
    art = _write_artifact(
        db,
        consent_id=item.id,
        event_type="granted",
        principal_email=item.principal_email,
        purpose=item.purpose,
        payload={
            "name": item.principal_name,
            "channel": item.channel,
            "notice_version": item.notice_version,
            "language": item.language,
        },
        org_id=current_user.organization_id,
    )
    item.artifact_hash = art.artifact_hash
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{consent_id}", response_model=ConsentResponse)
def update_consent(
    consent_id: int,
    payload: ConsentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(ConsentRecord).filter(ConsentRecord.id == consent_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Consent not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("status") == "withdrawn" and item.status != "withdrawn":
        return withdraw_consent(consent_id, db, current_user)
    for field, value in data.items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.post("/{consent_id}/withdraw", response_model=ConsentResponse)
def withdraw_consent(
    consent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(ConsentRecord).filter(ConsentRecord.id == consent_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Consent not found")
    if item.status == "withdrawn":
        return item

    item.status = "withdrawn"
    item.withdrawn_at = datetime.now(timezone.utc)

    # Notify vendors linked to this purpose
    vendor_names = _vendors_for_purpose(db, item.purpose, current_user.organization_id)
    notified_str = ", ".join(vendor_names) if vendor_names else None
    item.vendors_notified = notified_str

    art = _write_artifact(
        db,
        consent_id=item.id,
        event_type="withdrawn",
        principal_email=item.principal_email,
        purpose=item.purpose,
        payload={
            "name": item.principal_name,
            "channel": item.channel,
            "previous_hash": item.artifact_hash,
            "vendors_notified": vendor_names,
        },
        org_id=current_user.organization_id,
        vendors_notified=notified_str,
    )
    item.revoke_hash = art.artifact_hash

    msg = (
        f"Consent withdrawn for purpose '{item.purpose}' by {item.principal_email}."
        + (f" Processors notified: {notified_str}." if notified_str else " No matched vendors in registry.")
    )
    db.add(
        Notification(
            title=f"Consent revoked — {item.purpose}",
            message=msg,
            type="warning",
            link="/dashboard/consent",
            organization_id=current_user.organization_id,
        )
    )
    for vn in vendor_names:
        db.add(
            Notification(
                title=f"Processor action required: {vn}",
                message=(
                    f"Data principal {item.principal_email} withdrew consent for '{item.purpose}'. "
                    f"Stop processing for this purpose (DPDP — withdrawal as easy as grant)."
                ),
                type="alert",
                link="/dashboard/vendors",
                organization_id=current_user.organization_id,
            )
        )

    db.commit()
    db.refresh(item)
    return item


@router.get("/artifacts")
def list_artifacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(ConsentArtifact).order_by(ConsentArtifact.id.desc())
    if current_user.organization_id:
        q = q.filter(ConsentArtifact.organization_id == current_user.organization_id)
    return q.limit(200).all()


@router.get("/artifacts/verify")
def verify_chain(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Verify hash chain integrity of consent artifacts."""
    q = db.query(ConsentArtifact).order_by(ConsentArtifact.id.asc())
    if current_user.organization_id:
        q = q.filter(ConsentArtifact.organization_id == current_user.organization_id)
    rows = q.all()
    errors = []
    prev = None
    for r in rows:
        if prev is not None and r.prev_hash and r.prev_hash != prev:
            errors.append({"id": r.id, "error": "prev_hash mismatch", "expected": prev, "got": r.prev_hash})
        prev = r.artifact_hash
    return {
        "total": len(rows),
        "valid": len(errors) == 0,
        "errors": errors,
        "tip": "Immutable audit trail — each event hashes previous event (tamper-evident).",
    }
