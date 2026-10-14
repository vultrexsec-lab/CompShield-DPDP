from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.entities import ROPAEntry
from app.schemas.entities import ROPACreate, ROPAUpdate, ROPAResponse

router = APIRouter(prefix="/ropa", tags=["ROPA"])


@router.get("", response_model=List[ROPAResponse])
def list_ropa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(ROPAEntry)
    if current_user.organization_id:
        q = q.filter(ROPAEntry.organization_id == current_user.organization_id)
    return q.order_by(ROPAEntry.created_at.desc()).all()


@router.post("", response_model=ROPAResponse, status_code=status.HTTP_201_CREATED)
def create_ropa(
    payload: ROPACreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = ROPAEntry(
        **payload.model_dump(),
        organization_id=current_user.organization_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{ropa_id}", response_model=ROPAResponse)
def get_ropa(
    ropa_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(ROPAEntry).filter(ROPAEntry.id == ropa_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="ROPA entry not found")
    return item


@router.patch("/{ropa_id}", response_model=ROPAResponse)
def update_ropa(
    ropa_id: int,
    payload: ROPAUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(ROPAEntry).filter(ROPAEntry.id == ropa_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="ROPA entry not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    item.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{ropa_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ropa(
    ropa_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(ROPAEntry).filter(ROPAEntry.id == ropa_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="ROPA entry not found")
    db.delete(item)
    db.commit()
