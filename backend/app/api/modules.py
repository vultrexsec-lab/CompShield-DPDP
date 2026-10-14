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
    Integration, Notification, OrgSettings, PurposeMapping, DPATemplate,
)
from app.models.entities import DSARRequest, ConsentRecord, DataSource, ROPAEntry, RemediationTask

router = APIRouter(tags=["Modules"])


def _org(u: User):
    return u.organization_id


# ─── Schemas (inline for speed) ─────────────────────────
class VendorIn(BaseModel):
    name: str
    category: str = "Analytics"
    vendor_type: Optional[str] = None
    website_url: Optional[str] = None
    primary_domain: Optional[str] = None
    hq_country: Optional[str] = None
    contact_email: Optional[str] = None
    risk_level: str = "medium"
    status: str = "draft"
    onboarding_stage: int = 1
    onboarding_type: str = "manual"
    data_categories: Optional[str] = None
    processing_purpose: Optional[str] = None
    purposes: Optional[str] = None
    sub_processors: Optional[str] = None
    dpa_signed: bool = False
    dpa_expiry: Optional[str] = None
    certifications: Optional[str] = None
    cross_border: bool = False
    notes: Optional[str] = None

class BreachIn(BaseModel):
    title: str
    severity: str = "medium"
    status: str = "investigating"
    affected: Optional[str] = None
    description: Optional[str] = None
    data_categories: Optional[str] = None
    notified_board: bool = False
    notified_users: bool = False
    detected_at: Optional[str] = None

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
    data = p.model_dump()
    if data.get("onboarding_stage", 1) >= 6:
        data["status"] = "active"
        data["onboarding_stage"] = 6
    v = Vendor(**data, organization_id=_org(user))
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


# ─── Purpose Mapping ────────────────────────────────────
class PurposeIn(BaseModel):
    purpose_name: str
    description: Optional[str] = None
    legal_basis: str = "consent"
    vendor_ids: Optional[str] = None
    vendor_names: Optional[str] = None
    data_categories: Optional[str] = None
    retention_period: Optional[str] = None
    status: str = "active"


@router.get("/purposes")
def list_purposes(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(PurposeMapping)
    if _org(user):
        q = q.filter(PurposeMapping.organization_id == _org(user))
    items = q.order_by(PurposeMapping.created_at.desc()).all()
    if not items and _org(user):
        defaults = [
            ("Marketing Communications", "Email/SMS campaigns", "consent", "Email, Phone", "2 years"),
            ("Product Analytics", "Usage metrics and improvement", "legitimate_use", "Device, Usage data", "1 year"),
            ("Customer Support", "Ticket and call handling", "contract", "Name, Email, Phone", "3 years"),
            ("Payments", "Transaction processing", "contract", "Name, Financial", "7 years"),
        ]
        for name, desc, basis, cats, ret in defaults:
            db.add(PurposeMapping(
                purpose_name=name, description=desc, legal_basis=basis,
                data_categories=cats, retention_period=ret, status="active",
                organization_id=_org(user),
            ))
        db.commit()
        items = db.query(PurposeMapping).filter(PurposeMapping.organization_id == _org(user)).all()
    return items


@router.post("/purposes", status_code=201)
def create_purpose(p: PurposeIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = PurposeMapping(**p.model_dump(), organization_id=_org(user))
    db.add(item); db.commit(); db.refresh(item)
    return item


@router.patch("/purposes/{pid}")
def update_purpose(pid: int, p: PurposeIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(PurposeMapping).filter(PurposeMapping.id == pid).first()
    if not item: raise HTTPException(404, "Not found")
    for k, v in p.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit(); db.refresh(item)
    return item


@router.delete("/purposes/{pid}", status_code=204)
def delete_purpose(pid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(PurposeMapping).filter(PurposeMapping.id == pid).first()
    if not item: raise HTTPException(404, "Not found")
    db.delete(item); db.commit()


@router.post("/purposes/{pid}/link-vendor")
def link_vendor_to_purpose(pid: int, vendor_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(PurposeMapping).filter(PurposeMapping.id == pid).first()
    if not item: raise HTTPException(404, "Purpose not found")
    v = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not v: raise HTTPException(404, "Vendor not found")
    ids = [x for x in (item.vendor_ids or "").split(",") if x.strip()]
    names = [x for x in (item.vendor_names or "").split(",") if x.strip()]
    if str(vendor_id) not in ids:
        ids.append(str(vendor_id))
        names.append(v.name)
    item.vendor_ids = ",".join(ids)
    item.vendor_names = ", ".join(names)
    # also add purpose to vendor
    vp = [x.strip() for x in (v.purposes or "").split(",") if x.strip()]
    if item.purpose_name not in vp:
        vp.append(item.purpose_name)
        v.purposes = ", ".join(vp)
    db.commit(); db.refresh(item)
    return item


# ─── DPA Templates ──────────────────────────────────────
class DPAIn(BaseModel):
    title: str
    template_type: str = "standard"
    vendor_id: Optional[int] = None
    vendor_name: Optional[str] = None
    version: str = "1.0"
    status: str = "draft"
    body: Optional[str] = None
    signed_at: Optional[str] = None
    expires_at: Optional[str] = None


@router.get("/dpa-templates")
def list_dpa(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(DPATemplate)
    if _org(user):
        q = q.filter(DPATemplate.organization_id == _org(user))
    items = q.order_by(DPATemplate.created_at.desc()).all()
    if not items and _org(user):
        defaults = [
            ("Standard DPA — India DPDP", "standard", "1.0", "active",
             "This Data Processing Agreement governs processing of personal data under the Digital Personal Data Protection Act, 2023. The Processor shall process data only on documented instructions of the Fiduciary, implement appropriate security safeguards, and assist with data principal rights requests."),
            ("SCC Addendum — Cross-border", "standard", "1.0", "active",
             "Standard Contractual Clauses addendum for cross-border transfers. Parties agree to supplementary measures where required."),
            ("Vendor DPA — SaaS Processors", "standard", "1.1", "active",
             "Template for SaaS subprocessors including audit rights, breach notification within 72 hours, and sub-processor approval workflow."),
        ]
        for title, ttype, ver, st, body in defaults:
            db.add(DPATemplate(title=title, template_type=ttype, version=ver, status=st, body=body, organization_id=_org(user)))
        db.commit()
        items = db.query(DPATemplate).filter(DPATemplate.organization_id == _org(user)).all()
    return items


@router.post("/dpa-templates", status_code=201)
def create_dpa(p: DPAIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = DPATemplate(**p.model_dump(), organization_id=_org(user))
    db.add(item); db.commit(); db.refresh(item)
    return item


@router.patch("/dpa-templates/{did}")
def update_dpa(did: int, p: DPAIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(DPATemplate).filter(DPATemplate.id == did).first()
    if not item: raise HTTPException(404, "Not found")
    for k, v in p.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit(); db.refresh(item)
    return item


@router.post("/dpa-templates/{did}/sign")
def sign_dpa(did: int, vendor_id: Optional[int] = None, vendor_name: Optional[str] = None,
             expires_at: Optional[str] = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from datetime import datetime, timezone
    item = db.query(DPATemplate).filter(DPATemplate.id == did).first()
    if not item: raise HTTPException(404, "Not found")
    # create signed copy
    signed = DPATemplate(
        title=item.title + " (Signed)",
        template_type="signed",
        vendor_id=vendor_id or item.vendor_id,
        vendor_name=vendor_name or item.vendor_name,
        version=item.version,
        status="signed",
        body=item.body,
        signed_at=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        expires_at=expires_at,
        organization_id=_org(user),
    )
    db.add(signed)
    if vendor_id:
        v = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        if v:
            v.dpa_signed = True
            if expires_at:
                v.dpa_expiry = expires_at
    db.commit(); db.refresh(signed)
    return signed


@router.delete("/dpa-templates/{did}", status_code=204)
def delete_dpa(did: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(DPATemplate).filter(DPATemplate.id == did).first()
    if not item: raise HTTPException(404, "Not found")
    db.delete(item); db.commit()


# ─── Breach DPDP Rule 7 workflow (72 hours) ─────────────
@router.post("/breaches/{bid}/notify-board")
def breach_notify_board(bid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from datetime import datetime, timezone, timedelta
    b = db.query(BreachIncident).filter(BreachIncident.id == bid).first()
    if not b:
        raise HTTPException(404, "Not found")
    now = datetime.now(timezone.utc)
    b.notified_board = True
    b.board_notified_at = now.strftime("%Y-%m-%d %H:%M UTC")
    b.status = "board_notified"
    if not b.deadline_72h:
        b.deadline_72h = (now + timedelta(hours=72)).strftime("%Y-%m-%d %H:%M UTC")
    db.add(Notification(title=f"Breach {b.incident_id}: Board notified", message="Initial intimation (DPDP Rule 7). Detailed report due within 72h.", type="alert", link="/dashboard/breaches", organization_id=_org(user)))
    db.commit(); db.refresh(b)
    return b

@router.post("/breaches/{bid}/detailed-report")
def breach_detailed_report(bid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from datetime import datetime, timezone
    b = db.query(BreachIncident).filter(BreachIncident.id == bid).first()
    if not b:
        raise HTTPException(404, "Not found")
    if not b.notified_board:
        raise HTTPException(400, "Notify Board first")
    b.detailed_report_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    b.status = "detailed_report"
    db.add(Notification(title=f"Breach {b.incident_id}: Detailed report", message="72-hour detailed report filed.", type="info", link="/dashboard/breaches", organization_id=_org(user)))
    db.commit(); db.refresh(b)
    return b

@router.post("/breaches/{bid}/notify-principals")
def breach_notify_principals(bid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from datetime import datetime, timezone
    b = db.query(BreachIncident).filter(BreachIncident.id == bid).first()
    if not b:
        raise HTTPException(404, "Not found")
    b.notified_users = True
    b.principals_notified_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    b.status = "principals_notified"
    db.add(Notification(title=f"Breach {b.incident_id}: Principals notified", message=f"Affected: {b.affected or "N/A"}", type="success", link="/dashboard/breaches", organization_id=_org(user)))
    db.commit(); db.refresh(b)
    return b

@router.post("/breaches/{bid}/close")
def breach_close(bid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    b = db.query(BreachIncident).filter(BreachIncident.id == bid).first()
    if not b:
        raise HTTPException(404, "Not found")
    b.status = "closed"
    db.commit(); db.refresh(b)
    return b
