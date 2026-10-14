from datetime import datetime, timezone, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.entities import DSARRequest
from app.models.more_entities import DSARApprovalConfig, DSARApprovalAction, Notification
from app.schemas.entities import DSARCreate, DSARUpdate, DSARResponse

router = APIRouter(prefix="/dsar", tags=["DSAR"])


def _gen_request_id(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    count = db.query(DSARRequest).count() + 1
    return f"DSAR-{year}-{count:04d}"


def _apply_approval_rules(db: Session, item: DSARRequest, org_id) -> None:
    """If request type requires approval, set pending_approval."""
    cfg = (
        db.query(DSARApprovalConfig)
        .filter(
            DSARApprovalConfig.request_type == item.request_type,
            DSARApprovalConfig.organization_id == org_id,
        )
        .first()
    )
    if cfg and cfg.requires_approval:
        item.approval_status = "pending_approval"
        item.required_approval_levels = cfg.approval_levels
        item.current_approval_level = 0
        item.priority = cfg.priority or item.priority
        item.status = "pending_approval"
    else:
        item.approval_status = "not_required"
        item.required_approval_levels = 0


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
        priority="high" if payload.request_type == "erasure" else "medium",
    )
    _apply_approval_rules(db, item, current_user.organization_id)
    db.add(item)
    db.flush()
    db.add(
        Notification(
            title=f"New DSAR {item.request_id}",
            message=f"{item.request_type} from {item.principal_name}",
            type="info",
            link="/dashboard/dsar",
            organization_id=current_user.organization_id,
        )
    )
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


class DelegateBody(BaseModel):
    delegated_to: str
    comment: Optional[str] = None


@router.post("/{dsar_id}/delegate", response_model=DSARResponse)
def delegate_dsar(
    dsar_id: int,
    body: DelegateBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(DSARRequest).filter(DSARRequest.id == dsar_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="DSAR not found")
    item.delegated_to = body.delegated_to
    item.assigned_to = body.delegated_to
    item.status = "delegated"
    item.updated_at = datetime.now(timezone.utc)
    db.add(
        Notification(
            title=f"DSAR {item.request_id} delegated",
            message=f"Assigned to {body.delegated_to}" + (f" — {body.comment}" if body.comment else ""),
            type="info",
            link="/dashboard/dsar",
            organization_id=current_user.organization_id,
        )
    )
    db.commit()
    db.refresh(item)
    return item


@router.post("/{dsar_id}/escalate", response_model=DSARResponse)
def escalate_dsar(
    dsar_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(DSARRequest).filter(DSARRequest.id == dsar_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="DSAR not found")
    item.escalated = True
    item.priority = "high"
    item.status = "escalated"
    item.updated_at = datetime.now(timezone.utc)
    db.add(
        Notification(
            title=f"DSAR {item.request_id} escalated",
            message=f"{item.request_type} for {item.principal_name} needs attention",
            type="alert",
            link="/dashboard/dsar",
            organization_id=current_user.organization_id,
        )
    )
    db.commit()
    db.refresh(item)
    return item


class ApproveBody(BaseModel):
    action: str  # approved | rejected
    comment: Optional[str] = None


@router.post("/{dsar_id}/approve", response_model=DSARResponse)
def approve_dsar(
    dsar_id: int,
    body: ApproveBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(DSARRequest).filter(DSARRequest.id == dsar_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="DSAR not found")
    if item.approval_status not in ("pending_approval", "not_required"):
        if item.approval_status == "approved" and body.action == "approved":
            raise HTTPException(400, "Already fully approved")
    if body.action not in ("approved", "rejected"):
        raise HTTPException(400, "action must be approved or rejected")

    level = (item.current_approval_level or 0) + 1
    db.add(
        DSARApprovalAction(
            dsar_id=item.id,
            level=level,
            action=body.action,
            actor_email=current_user.email,
            comment=body.comment,
        )
    )

    if body.action == "rejected":
        item.approval_status = "rejected"
        item.status = "rejected"
        item.current_approval_level = level
    else:
        item.current_approval_level = level
        required = item.required_approval_levels or 1
        if level >= required:
            item.approval_status = "approved"
            item.status = "in_progress"
        else:
            item.approval_status = "pending_approval"
            item.status = "pending_approval"

    item.updated_at = datetime.now(timezone.utc)
    db.add(
        Notification(
            title=f"DSAR {item.request_id} {body.action}",
            message=f"Level {level} by {current_user.email}",
            type="success" if body.action == "approved" else "warning",
            link="/dashboard/dsar",
            organization_id=current_user.organization_id,
        )
    )
    db.commit()
    db.refresh(item)
    return item


@router.post("/{dsar_id}/complete", response_model=DSARResponse)
def complete_dsar(
    dsar_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(DSARRequest).filter(DSARRequest.id == dsar_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="DSAR not found")
    if item.approval_status == "pending_approval":
        raise HTTPException(400, "Cannot complete while approval is pending")
    if item.approval_status == "rejected":
        raise HTTPException(400, "Rejected requests cannot be completed")
    item.status = "completed"
    item.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{dsar_id}/approvals")
def list_approvals(
    dsar_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(DSARApprovalAction)
        .filter(DSARApprovalAction.dsar_id == dsar_id)
        .order_by(DSARApprovalAction.level)
        .all()
    )


# ─── Approval configuration ─────────────────────────────
class ApprovalConfigIn(BaseModel):
    request_type: str
    requires_approval: bool = True
    approval_levels: int = 1
    priority: str = "high"
    sla_days: int = 30


@router.get("/config/approvals")
def list_approval_configs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(DSARApprovalConfig)
    if current_user.organization_id:
        q = q.filter(DSARApprovalConfig.organization_id == current_user.organization_id)
    items = q.all()
    if not items and current_user.organization_id:
        # seed defaults
        defaults = [
            ("access", False, 0, "medium", 30),
            ("correction", False, 0, "medium", 30),
            ("portability", False, 0, "medium", 30),
            ("erasure", True, 2, "high", 15),
            ("restriction", True, 1, "high", 20),
        ]
        for rtype, req, levels, pri, sla in defaults:
            db.add(
                DSARApprovalConfig(
                    request_type=rtype,
                    requires_approval=req,
                    approval_levels=levels,
                    priority=pri,
                    sla_days=sla,
                    organization_id=current_user.organization_id,
                )
            )
        db.commit()
        items = (
            db.query(DSARApprovalConfig)
            .filter(DSARApprovalConfig.organization_id == current_user.organization_id)
            .all()
        )
    return items


@router.post("/config/approvals", status_code=201)
def upsert_approval_config(
    body: ApprovalConfigIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(DSARApprovalConfig)
        .filter(
            DSARApprovalConfig.request_type == body.request_type,
            DSARApprovalConfig.organization_id == current_user.organization_id,
        )
        .first()
    )
    if existing:
        existing.requires_approval = body.requires_approval
        existing.approval_levels = body.approval_levels
        existing.priority = body.priority
        existing.sla_days = body.sla_days
        db.commit()
        db.refresh(existing)
        return existing
    cfg = DSARApprovalConfig(
        **body.model_dump(),
        organization_id=current_user.organization_id,
    )
    db.add(cfg)
    db.commit()
    db.refresh(cfg)
    return cfg


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
