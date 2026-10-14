from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.entities import ConsentRecord
from app.schemas.entities import ConsentCreate, ConsentUpdate, ConsentResponse

router = APIRouter(prefix="/consent", tags=["Consent"])


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
        notice_version=payload.notice_version,
        organization_id=current_user.organization_id,
    )
    db.add(item)
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
        item.withdrawn_at = datetime.now(timezone.utc)
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
    item.status = "withdrawn"
    item.withdrawn_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item
