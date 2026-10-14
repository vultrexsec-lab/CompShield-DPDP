from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date


# ─── DSAR ───────────────────────────────────────────────
class DSARCreate(BaseModel):
    request_type: str = "access"
    principal_name: str
    principal_email: EmailStr
    principal_phone: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None


class DSARUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None


class DSARResponse(BaseModel):
    id: int
    request_id: str
    request_type: str
    status: str
    principal_name: str
    principal_email: str
    principal_phone: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    delegated_to: Optional[str] = None
    priority: Optional[str] = "medium"
    approval_status: Optional[str] = "not_required"
    current_approval_level: Optional[int] = 0
    required_approval_levels: Optional[int] = 0
    escalated: Optional[bool] = False
    due_date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Consent ────────────────────────────────────────────
class ConsentCreate(BaseModel):
    principal_name: str
    principal_email: EmailStr
    purpose: str
    channel: str = "website"
    notice_version: Optional[str] = "v1.0"


class ConsentUpdate(BaseModel):
    status: Optional[str] = None
    purpose: Optional[str] = None


class ConsentResponse(BaseModel):
    id: int
    principal_name: str
    principal_email: str
    purpose: str
    channel: str
    status: str
    notice_version: Optional[str] = None
    language: Optional[str] = "en"
    artifact_hash: Optional[str] = None
    revoke_hash: Optional[str] = None
    vendors_notified: Optional[str] = None
    given_at: Optional[datetime] = None
    withdrawn_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Data Source ────────────────────────────────────────
class DataSourceCreate(BaseModel):
    name: str
    source_type: str = "database"
    connection_info: Optional[str] = None
    host: Optional[str] = None
    db_engine: Optional[str] = None
    schema_name: Optional[str] = None
    selected_tables: Optional[str] = None
    selected_columns: Optional[str] = None


class DataSourceResponse(BaseModel):
    id: int
    name: str
    source_type: str
    connection_info: Optional[str] = None
    host: Optional[str] = None
    db_engine: Optional[str] = None
    schema_name: Optional[str] = None
    selected_tables: Optional[str] = None
    selected_columns: Optional[str] = None
    onboarding_stage: Optional[int] = 1
    status: str
    records_found: int
    pii_count: int
    last_scanned: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Discovery Finding ──────────────────────────────────
class FindingResponse(BaseModel):
    id: int
    source_id: Optional[int] = None
    pii_type: str
    location: str
    sample_masked: Optional[str] = None
    confidence: float
    severity: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── ROPA ───────────────────────────────────────────────
class ROPACreate(BaseModel):
    activity_name: str
    purpose: str
    legal_basis: str = "consent"
    data_categories: str
    data_subjects: str = "customers"
    recipients: Optional[str] = None
    retention_period: Optional[str] = None
    security_measures: Optional[str] = None
    cross_border: bool = False


class ROPAUpdate(BaseModel):
    activity_name: Optional[str] = None
    purpose: Optional[str] = None
    legal_basis: Optional[str] = None
    data_categories: Optional[str] = None
    data_subjects: Optional[str] = None
    recipients: Optional[str] = None
    retention_period: Optional[str] = None
    security_measures: Optional[str] = None
    cross_border: Optional[bool] = None


class ROPAResponse(BaseModel):
    id: int
    activity_name: str
    purpose: str
    legal_basis: str
    data_categories: str
    data_subjects: str
    recipients: Optional[str] = None
    retention_period: Optional[str] = None
    security_measures: Optional[str] = None
    cross_border: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Remediation ────────────────────────────────────────
class RemediationCreate(BaseModel):
    title: str
    action: str = "mask"
    severity: str = "medium"
    source: Optional[str] = None
    impact: Optional[str] = None
    finding_id: Optional[int] = None


class RemediationUpdate(BaseModel):
    status: Optional[str] = None
    action: Optional[str] = None


class RemediationResponse(BaseModel):
    id: int
    task_id: str
    finding_id: Optional[int] = None
    title: str
    action: str
    severity: str
    status: str
    source: Optional[str] = None
    impact: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Dashboard stats ────────────────────────────────────
class DashboardStats(BaseModel):
    dsar_total: int = 0
    dsar_pending: int = 0
    consent_active: int = 0
    consent_withdrawn: int = 0
    sources_count: int = 0
    findings_open: int = 0
    remediation_open: int = 0
    ropa_count: int = 0
