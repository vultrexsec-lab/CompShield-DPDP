from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.entities import RemediationTask
from app.schemas.entities import RemediationCreate, RemediationUpdate, RemediationResponse

router = APIRouter(prefix="/remediation", tags=["Remediation"])


def _gen_task_id(db: Session) -> str:
    count = db.query(RemediationTask).count() + 1
    return f"REM-{count:03d}"


@router.get("", response_model=List[RemediationResponse])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(RemediationTask)
    if current_user.organization_id:
        q = q.filter(RemediationTask.organization_id == current_user.organization_id)
    return q.order_by(RemediationTask.created_at.desc()).all()


@router.post("", response_model=RemediationResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: RemediationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = RemediationTask(
        task_id=_gen_task_id(db),
        title=payload.title,
        action=payload.action,
        severity=payload.severity,
        source=payload.source,
        impact=payload.impact,
        finding_id=payload.finding_id,
        status="open",
        organization_id=current_user.organization_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{task_id}", response_model=RemediationResponse)
def update_task(
    task_id: int,
    payload: RemediationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(RemediationTask).filter(RemediationTask.id == task_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Task not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("status") == "completed":
        item.completed_at = datetime.now(timezone.utc)
    for field, value in data.items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item
