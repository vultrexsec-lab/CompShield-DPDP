from datetime import datetime, timezone, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.entities import DSARRequest
from app.schemas.entities import DSARCreate, DSARUpdate, DSARResponse

router = APIRouter(prefix="/dsar", tags=["DSAR"])


def _gen_request_id(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    count = db.query(DSARRequest).count() + 1
    return f"DSAR-{year}-{count:04d}"


@router.get("", response_model=List[DSARResponse])
def list_dsar(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(DSARRequest)
    if current_user.organization_id:
        q = q.filter(DSARRequest.organization_id == current_user.organization_id)
    if status_filter:
        q = q.filter(DSARRequest.status == status_filter)
    return q.order_by(DSARRequest.created_at.desc()).all()


@router.post("", response_model=DSARResponse, status_code=status.HTTP_201_CREATED)
def create_dsar(
    payload: DSARCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    due = payload.due_date or (date.today() + timedelta(days=30))
    item = DSARRequest(
        request_id=_gen_request_id(db),
        request_type=payload.request_type,
        status="pending",
        principal_name=payload.principal_name,
        principal_email=payload.principal_email.lower(),
        principal_phone=payload.principal_phone,
        description=payload.description,
        assigned_to=payload.assigned_to,
        due_date=due,
        organization_id=current_user.organization_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{dsar_id}", response_model=DSARResponse)
def get_dsar(
    dsar_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(DSARRequest).filter(DSARRequest.id == dsar_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="DSAR not found")
    return item


@router.patch("/{dsar_id}", response_model=DSARResponse)
def update_dsar(
    dsar_id: int,
    payload: DSARUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(DSARRequest).filter(DSARRequest.id == dsar_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="DSAR not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    item.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{dsar_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dsar(
    dsar_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(DSARRequest).filter(DSARRequest.id == dsar_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="DSAR not found")
    db.delete(item)
    db.commit()
