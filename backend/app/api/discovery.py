from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.entities import DataSource, DiscoveryFinding
from app.schemas.entities import DataSourceCreate, DataSourceResponse, FindingResponse

router = APIRouter(prefix="/discovery", tags=["Data Discovery"])


@router.get("/sources", response_model=List[DataSourceResponse])
def list_sources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(DataSource)
    if current_user.organization_id:
        q = q.filter(DataSource.organization_id == current_user.organization_id)
    return q.order_by(DataSource.created_at.desc()).all()


@router.post("/sources", response_model=DataSourceResponse, status_code=status.HTTP_201_CREATED)
def create_source(
    payload: DataSourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = DataSource(
        name=payload.name,
        source_type=payload.source_type,
        connection_info=payload.connection_info,
        status="pending",
        organization_id=current_user.organization_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/sources/{source_id}/scan", response_model=DataSourceResponse)
def scan_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Simulate a discovery scan and create sample findings."""
    source = db.query(DataSource).filter(DataSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    source.status = "completed"
    source.last_scanned = datetime.now(timezone.utc)
    source.records_found = 1250
    source.pii_count = 48

    # Sample findings for demo
    samples = [
        ("aadhaar", "employees.aadhaar_number", "XXXX-XXXX-1234", 0.98, "high"),
        ("pan", "employees.pan", "ABCDE****F", 0.97, "high"),
        ("email", "customers.email", "u***@email.com", 0.99, "medium"),
        ("phone", "customers.phone", "+91-****3210", 0.95, "medium"),
        ("credit_card", "payments.card_last4", "****-****-****-4242", 0.92, "high"),
    ]
    for pii_type, loc, masked, conf, sev in samples:
        finding = DiscoveryFinding(
            source_id=source.id,
            pii_type=pii_type,
            location=loc,
            sample_masked=masked,
            confidence=conf,
            severity=sev,
            status="open",
            organization_id=current_user.organization_id,
        )
        db.add(finding)

    db.commit()
    db.refresh(source)
    return source


@router.get("/findings", response_model=List[FindingResponse])
def list_findings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(DiscoveryFinding)
    if current_user.organization_id:
        q = q.filter(DiscoveryFinding.organization_id == current_user.organization_id)
    return q.order_by(DiscoveryFinding.created_at.desc()).all()
