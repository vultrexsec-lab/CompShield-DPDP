"""Additional DPDP modules: vendors, breaches, DPIA, gap, cookies, integrations, notifications."""
from datetime import datetime, timezone, date
from sqlalchemy import String, Boolean, DateTime, Date, ForeignKey, Text, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Vendor(Base):
    __tablename__ = "vendors"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(100), default="SaaS")  # Analytics, Advertising...
    vendor_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    primary_domain: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hq_country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    risk_level: Mapped[str] = mapped_column(String(50), default="medium")
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft | pending_review | active
    onboarding_stage: Mapped[int] = mapped_column(Integer, default=1)  # 1-6
    onboarding_type: Mapped[str] = mapped_column(String(50), default="manual")  # manual | self
    # Data processing
    data_categories: Mapped[str | None] = mapped_column(Text, nullable=True)  # comma-separated
    processing_purpose: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Purpose mapping
    purposes: Mapped[str | None] = mapped_column(Text, nullable=True)  # Marketing, Analytics...
    # Sub-processors
    sub_processors: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Compliance & DPA
    dpa_signed: Mapped[bool] = mapped_column(Boolean, default=False)
    dpa_expiry: Mapped[str | None] = mapped_column(String(50), nullable=True)
    certifications: Mapped[str | None] = mapped_column(String(500), nullable=True)  # ISO, SOC2
    cross_border: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class BreachIncident(Base):
    __tablename__ = "breach_incidents"
    id: Mapped[int] = mapped_column(primary_key=True)
    incident_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(500))
    severity: Mapped[str] = mapped_column(String(50), default="medium")
    status: Mapped[str] = mapped_column(String(50), default="investigating")
    affected: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notified_board: Mapped[bool] = mapped_column(Boolean, default=False)
    notified_users: Mapped[bool] = mapped_column(Boolean, default=False)
    detected_at: Mapped[str | None] = mapped_column(String(100), nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class DPIARecord(Base):
    __tablename__ = "dpia_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(50), default="draft")
    risk_level: Mapped[str] = mapped_column(String(50), default="medium")
    owner: Mapped[str | None] = mapped_column(String(255), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class GapItem(Base):
    __tablename__ = "gap_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    department: Mapped[str] = mapped_column(String(100), default="General")
    severity: Mapped[str] = mapped_column(String(50), default="medium")
    status: Mapped[str] = mapped_column(String(50), default="open")
    recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class CookieConfig(Base):
    __tablename__ = "cookie_configs"
    id: Mapped[int] = mapped_column(primary_key=True)
    domain: Mapped[str] = mapped_column(String(255))
    banner_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    essential_only: Mapped[bool] = mapped_column(Boolean, default=False)
    analytics: Mapped[bool] = mapped_column(Boolean, default=True)
    marketing: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_count: Mapped[int] = mapped_column(Integer, default=0)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Integration(Base):
    __tablename__ = "integrations"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(100), default="Database")
    status: Mapped[str] = mapped_column(String(50), default="available")  # connected | available
    records_synced: Mapped[str | None] = mapped_column(String(100), nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(50), default="info")  # info | warning | success | alert
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    link: Mapped[str | None] = mapped_column(String(255), nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class OrgSettings(Base):
    __tablename__ = "org_settings"
    id: Mapped[int] = mapped_column(primary_key=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), unique=True)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    dpo_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    dpo_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default="Asia/Kolkata")
    dsar_sla_days: Mapped[int] = mapped_column(Integer, default=30)
    notify_email: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_inapp: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class DSARApprovalConfig(Base):
    """Risk-based approval rules: e.g. erasure requires 2-level approval."""
    __tablename__ = "dsar_approval_configs"
    id: Mapped[int] = mapped_column(primary_key=True)
    request_type: Mapped[str] = mapped_column(String(50))  # access, erasure, correction...
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=False)
    approval_levels: Mapped[int] = mapped_column(Integer, default=1)
    priority: Mapped[str] = mapped_column(String(50), default="medium")  # low medium high
    sla_days: Mapped[int] = mapped_column(Integer, default=30)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class DSARApprovalAction(Base):
    """Each level approval/rejection on a DSAR."""
    __tablename__ = "dsar_approval_actions"
    id: Mapped[int] = mapped_column(primary_key=True)
    dsar_id: Mapped[int] = mapped_column(ForeignKey("dsar_requests.id"))
    level: Mapped[int] = mapped_column(Integer, default=1)
    action: Mapped[str] = mapped_column(String(50))  # approved | rejected | pending
    actor_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PurposeMapping(Base):
    """Maps processing purposes to vendors / consent channels."""
    __tablename__ = "purpose_mappings"
    id: Mapped[int] = mapped_column(primary_key=True)
    purpose_name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    legal_basis: Mapped[str] = mapped_column(String(100), default="consent")
    vendor_ids: Mapped[str | None] = mapped_column(Text, nullable=True)  # comma-separated vendor ids
    vendor_names: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_categories: Mapped[str | None] = mapped_column(Text, nullable=True)
    retention_period: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active")
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class DPATemplate(Base):
    """Data Processing Agreement templates and signed records."""
    __tablename__ = "dpa_templates"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    template_type: Mapped[str] = mapped_column(String(100), default="standard")  # standard | custom | signed
    vendor_id: Mapped[int | None] = mapped_column(ForeignKey("vendors.id"), nullable=True)
    vendor_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    version: Mapped[str] = mapped_column(String(50), default="1.0")
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft | active | signed | expired
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    signed_at: Mapped[str | None] = mapped_column(String(50), nullable=True)
    expires_at: Mapped[str | None] = mapped_column(String(50), nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
