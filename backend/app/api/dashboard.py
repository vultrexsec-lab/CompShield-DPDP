from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.entities import (
    DSARRequest,
    ConsentRecord,
    DataSource,
    DiscoveryFinding,
    RemediationTask,
    ROPAEntry,
)
from app.schemas.entities import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = current_user.organization_id

    def scoped(model):
        q = db.query(model)
        if org_id:
            q = q.filter(model.organization_id == org_id)
        return q

    return DashboardStats(
        dsar_total=scoped(DSARRequest).count(),
        dsar_pending=scoped(DSARRequest).filter(DSARRequest.status == "pending").count(),
        consent_active=scoped(ConsentRecord).filter(ConsentRecord.status == "active").count(),
        consent_withdrawn=scoped(ConsentRecord).filter(ConsentRecord.status == "withdrawn").count(),
        sources_count=scoped(DataSource).count(),
        findings_open=scoped(DiscoveryFinding).filter(DiscoveryFinding.status == "open").count(),
        remediation_open=scoped(RemediationTask).filter(RemediationTask.status == "open").count(),
        ropa_count=scoped(ROPAEntry).count(),
    )
