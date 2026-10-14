"""Vendors, Breaches, DPIA, Gap, Cookies, Integrations, Notifications, Settings, Reports."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, Organization
from app.models.more_entities import (
    Vendor, BreachIncident, DPIARecord, GapItem, CookieConfig,
    Integration, Notification, OrgSettings,
)
from app.models.entities import DSARRequest, ConsentRecord, DataSource, ROPAEntry, RemediationTask

router = APIRouter(tags=["Modules"])


def _org(u: User):
    return u.organization_id


# ─── Schemas (inline for speed) ─────────────────────────
class VendorIn(BaseModel):
    name: str
    category: str = "SaaS"
    risk_level: str = "medium"
    status: str = "active"
    dpa_signed: bool = False
    contact_email: Optional[str] = None
    notes: Optional[str] = None

class BreachIn(BaseModel):
    title: str
    severity: str = "medium"
    affected: Optional[str] = None

class DPIAIn(BaseModel):
    title: str
    status: str = "draft"
    risk_level: str = "medium"
    owner: Optional[str] = None
    summary: Optional[str] = None

class GapIn(BaseModel):
    title: str
    department: str = "General"
    severity: str = "medium"
    recommendation: Optional[str] = None

class CookieIn(BaseModel):
    domain: str
    banner_enabled: bool = True
    essential_only: bool = False
    analytics: bool = True
    marketing: bool = False

class SettingsIn(BaseModel):
    company_name: Optional[str] = None
    dpo_name: Optional[str] = None
    dpo_email: Optional[str] = None
    timezone: Optional[str] = None
    dsar_sla_days: Optional[int] = None
    notify_email: Optional[bool] = None
    notify_inapp: Optional[bool] = None


# ─── Vendors ────────────────────────────────────────────
@router.get("/vendors")
def list_vendors(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Vendor)
    if _org(user):
        q = q.filter(Vendor.organization_id == _org(user))
    return q.order_by(Vendor.created_at.desc()).all()

@router.post("/vendors", status_code=201)
def create_vendor(p: VendorIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    v = Vendor(**p.model_dump(), organization_id=_org(user))
    db.add(v); db.commit(); db.refresh(v)
    return v

@router.patch("/vendors/{vid}")
def update_vendor(vid: int, p: VendorIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    v = db.query(Vendor).filter(Vendor.id == vid).first()
    if not v: raise HTTPException(404, "Not found")
    for k, val in p.model_dump(exclude_unset=True).items():
        setattr(v, k, val)
    db.commit(); db.refresh(v)
    return v

@router.delete("/vendors/{vid}", status_code=204)
def delete_vendor(vid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    v = db.query(Vendor).filter(Vendor.id == vid).first()
    if not v: raise HTTPException(404, "Not found")
    db.delete(v); db.commit()


# ─── Breaches ───────────────────────────────────────────
@router.get("/breaches")
def list_breaches(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(BreachIncident)
    if _org(user): q = q.filter(BreachIncident.organization_id == _org(user))
    return q.order_by(BreachIncident.created_at.desc()).all()

@router.post("/breaches", status_code=201)
def create_breach(p: BreachIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    n = db.query(BreachIncident).count() + 1
    b = BreachIncident(
        incident_id=f"BR-2026-{n:03d}",
        title=p.title, severity=p.severity, affected=p.affected,
        status="investigating",
        detected_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
        organization_id=_org(user),
    )
    db.add(b); db.commit(); db.refresh(b)
    # notification
    db.add(Notification(
        title="New breach logged", message=p.title, type="alert",
        link="/dashboard/breaches", organization_id=_org(user),
    ))
    db.commit()
    return b

@router.patch("/breaches/{bid}")
def update_breach(bid: int, status_val: Optional[str] = None, notified_board: Optional[bool] = None,
                  notified_users: Optional[bool] = None, db: Session = Depends(get_db),
                  user: User = Depends(get_current_user)):
    b = db.query(BreachIncident).filter(BreachIncident.id == bid).first()
    if not b: raise HTTPException(404, "Not found")
    if status_val: b.status = status_val
    if notified_board is not None: b.notified_board = notified_board
    if notified_users is not None: b.notified_users = notified_users
    db.commit(); db.refresh(b)
    return b


# ─── DPIA ───────────────────────────────────────────────
@router.get("/dpia")
def list_dpia(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(DPIARecord)
    if _org(user): q = q.filter(DPIARecord.organization_id == _org(user))
    return q.order_by(DPIARecord.created_at.desc()).all()

@router.post("/dpia", status_code=201)
def create_dpia(p: DPIAIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    d = DPIARecord(**p.model_dump(), organization_id=_org(user))
    db.add(d); db.commit(); db.refresh(d)
    return d

@router.patch("/dpia/{did}")
def update_dpia(did: int, p: DPIAIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    d = db.query(DPIARecord).filter(DPIARecord.id == did).first()
    if not d: raise HTTPException(404, "Not found")
    for k, val in p.model_dump(exclude_unset=True).items():
        setattr(d, k, val)
    d.updated_at = datetime.now(timezone.utc)
    db.commit(); db.refresh(d)
    return d


# ─── Gap Assessment ─────────────────────────────────────
@router.get("/gaps")
def list_gaps(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(GapItem)
    if _org(user): q = q.filter(GapItem.organization_id == _org(user))
    return q.order_by(GapItem.created_at.desc()).all()

@router.post("/gaps", status_code=201)
def create_gap(p: GapIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    g = GapItem(**p.model_dump(), status="open", organization_id=_org(user))
    db.add(g); db.commit(); db.refresh(g)
    return g

@router.patch("/gaps/{gid}")
def update_gap(gid: int, status_val: Optional[str] = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    g = db.query(GapItem).filter(GapItem.id == gid).first()
    if not g: raise HTTPException(404, "Not found")
    if status_val: g.status = status_val
    db.commit(); db.refresh(g)
    return g


# ─── Cookies ────────────────────────────────────────────
@router.get("/cookies")
def list_cookies(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(CookieConfig)
    if _org(user): q = q.filter(CookieConfig.organization_id == _org(user))
    return q.all()

@router.post("/cookies", status_code=201)
def create_cookie(p: CookieIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    c = CookieConfig(**p.model_dump(), organization_id=_org(user))
    db.add(c); db.commit(); db.refresh(c)
    return c

@router.patch("/cookies/{cid}")
def update_cookie(cid: int, p: CookieIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    c = db.query(CookieConfig).filter(CookieConfig.id == cid).first()
    if not c: raise HTTPException(404, "Not found")
    for k, val in p.model_dump(exclude_unset=True).items():
        setattr(c, k, val)
    db.commit(); db.refresh(c)
    return c


# ─── Integrations ───────────────────────────────────────
@router.get("/integrations")
def list_integrations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Integration)
    if _org(user): q = q.filter(Integration.organization_id == _org(user))
    items = q.all()
    if not items:
        # seed defaults for org
        defaults = [
            ("PostgreSQL", "Database"), ("MySQL", "Database"), ("SQL Server", "Database"),
            ("Snowflake", "Data Warehouse"), ("AWS S3", "Storage"), ("Office 365", "Productivity"),
            ("Salesforce", "CRM"), ("Zendesk", "Support"), ("Razorpay", "Payments"),
            ("Google Workspace", "Productivity"), ("HubSpot", "CRM"), ("MongoDB", "Database"),
        ]
        for name, cat in defaults:
            i = Integration(name=name, category=cat, status="available", organization_id=_org(user))
            db.add(i)
        db.commit()
        items = db.query(Integration).filter(Integration.organization_id == _org(user)).all()
    return items

@router.post("/integrations/{iid}/connect")
def connect_integration(iid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    i = db.query(Integration).filter(Integration.id == iid).first()
    if not i: raise HTTPException(404, "Not found")
    i.status = "connected"
    i.records_synced = "Syncing..."
    db.commit(); db.refresh(i)
    db.add(Notification(title=f"{i.name} connected", message="Integration is now active", type="success",
                        link="/dashboard/integrations", organization_id=_org(user)))
    db.commit()
    return i

@router.post("/integrations/{iid}/disconnect")
def disconnect_integration(iid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    i = db.query(Integration).filter(Integration.id == iid).first()
    if not i: raise HTTPException(404, "Not found")
    i.status = "available"
    i.records_synced = None
    db.commit(); db.refresh(i)
    return i


# ─── Notifications ──────────────────────────────────────
@router.get("/notifications")
def list_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Notification)
    if _org(user): q = q.filter(Notification.organization_id == _org(user))
    return q.order_by(Notification.created_at.desc()).limit(50).all()

@router.post("/notifications/{nid}/read")
def mark_read(nid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    n = db.query(Notification).filter(Notification.id == nid).first()
    if not n: raise HTTPException(404, "Not found")
    n.read = True
    db.commit(); db.refresh(n)
    return n

@router.post("/notifications/read-all")
def mark_all_read(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Notification).filter(Notification.read == False)
    if _org(user): q = q.filter(Notification.organization_id == _org(user))
    q.update({"read": True})
    db.commit()
    return {"ok": True}


# ─── Settings ───────────────────────────────────────────
@router.get("/settings")
def get_settings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    org_id = _org(user)
    s = db.query(OrgSettings).filter(OrgSettings.organization_id == org_id).first() if org_id else None
    org = db.query(Organization).filter(Organization.id == org_id).first() if org_id else None
    if not s and org_id:
        s = OrgSettings(
            organization_id=org_id,
            company_name=org.name if org else "Organization",
            dpo_name=org.dpo_name if org else None,
            dpo_email=org.dpo_email if org else None,
        )
        db.add(s); db.commit(); db.refresh(s)
    return s or {}

@router.patch("/settings")
def update_settings(p: SettingsIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    org_id = _org(user)
    if not org_id: raise HTTPException(400, "No organization")
    s = db.query(OrgSettings).filter(OrgSettings.organization_id == org_id).first()
    if not s:
        s = OrgSettings(organization_id=org_id)
        db.add(s)
    for k, val in p.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(s, k, val)
    s.updated_at = datetime.now(timezone.utc)
    db.commit(); db.refresh(s)
    return s


# ─── Reports ────────────────────────────────────────────
@router.get("/reports/summary")
def reports_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    oid = _org(user)
    def c(model):
        q = db.query(model)
        if oid and hasattr(model, "organization_id"):
            q = q.filter(model.organization_id == oid)
        return q.count()
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "organization": user.organization.name if user.organization else None,
        "dsar_total": c(DSARRequest),
        "consent_total": c(ConsentRecord),
        "sources_total": c(DataSource),
        "ropa_total": c(ROPAEntry),
        "remediation_open": db.query(RemediationTask).filter(
            RemediationTask.organization_id == oid, RemediationTask.status != "completed"
        ).count() if oid else 0,
        "vendors_total": c(Vendor),
        "breaches_total": c(BreachIncident),
        "dpia_total": c(DPIARecord),
        "gaps_open": db.query(GapItem).filter(GapItem.organization_id == oid, GapItem.status == "open").count() if oid else 0,
        "reports": [
            {"id": "dsar-register", "name": "DSAR Register", "type": "compliance"},
            {"id": "consent-log", "name": "Consent Audit Log", "type": "compliance"},
            {"id": "ropa-export", "name": "ROPA Export", "type": "compliance"},
            {"id": "breach-register", "name": "Breach Register", "type": "incident"},
            {"id": "gap-summary", "name": "Gap Assessment Summary", "type": "assessment"},
            {"id": "vendor-risk", "name": "Vendor Risk Report", "type": "risk"},
        ],
    }
