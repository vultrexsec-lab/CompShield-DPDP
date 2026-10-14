"""Core DPDP compliance entities."""
from datetime import datetime, timezone, date
from sqlalchemy import (
    String, Boolean, DateTime, Date, ForeignKey, Text, Integer, Float, Enum
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class DSARStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    rejected = "rejected"


class DSARType(str, enum.Enum):
    access = "access"
    correction = "correction"
    erasure = "erasure"
    portability = "portability"
    restriction = "restriction"


class ConsentStatus(str, enum.Enum):
    active = "active"
    withdrawn = "withdrawn"
    expired = "expired"


class DiscoveryStatus(str, enum.Enum):
    pending = "pending"
    scanning = "scanning"
    completed = "completed"
    failed = "failed"


class Severity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


# ─── DSAR ───────────────────────────────────────────────
class DSARRequest(Base):
    __tablename__ = "dsar_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    request_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    request_type: Mapped[str] = mapped_column(String(50), default="access")
    status: Mapped[str] = mapped_column(String(50), default="pending")
    principal_name: Mapped[str] = mapped_column(String(255))
    principal_email: Mapped[str] = mapped_column(String(255), index=True)
    principal_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


# ─── Consent ────────────────────────────────────────────
class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    principal_name: Mapped[str] = mapped_column(String(255))
    principal_email: Mapped[str] = mapped_column(String(255), index=True)
    purpose: Mapped[str] = mapped_column(String(255))
    channel: Mapped[str] = mapped_column(String(100), default="website")  # website, app, offline
    status: Mapped[str] = mapped_column(String(50), default="active")
    notice_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    given_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    withdrawn_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


# ─── Data Discovery Source ──────────────────────────────
class DataSource(Base):
    __tablename__ = "data_sources"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(100))  # database, saas, file, cloud
    connection_info: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    records_found: Mapped[int] = mapped_column(Integer, default=0)
    pii_count: Mapped[int] = mapped_column(Integer, default=0)
    last_scanned: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


# ─── Discovery Finding (PII hits) ───────────────────────
class DiscoveryFinding(Base):
    __tablename__ = "discovery_findings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"), nullable=True)
    pii_type: Mapped[str] = mapped_column(String(100))  # aadhaar, pan, email, phone, card...
    location: Mapped[str] = mapped_column(String(500))  # table.column or file path
    sample_masked: Mapped[str | None] = mapped_column(String(255), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.9)
    severity: Mapped[str] = mapped_column(String(50), default="medium")
    status: Mapped[str] = mapped_column(String(50), default="open")  # open, remediated, ignored
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


# ─── ROPA (Record of Processing Activities) ─────────────
class ROPAEntry(Base):
    __tablename__ = "ropa_entries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    activity_name: Mapped[str] = mapped_column(String(255))
    purpose: Mapped[str] = mapped_column(Text)
    legal_basis: Mapped[str] = mapped_column(String(100), default="consent")
    data_categories: Mapped[str] = mapped_column(Text)  # comma-separated
    data_subjects: Mapped[str] = mapped_column(String(255), default="customers")
    recipients: Mapped[str | None] = mapped_column(Text, nullable=True)
    retention_period: Mapped[str | None] = mapped_column(String(100), nullable=True)
    security_measures: Mapped[str | None] = mapped_column(Text, nullable=True)
    cross_border: Mapped[bool] = mapped_column(Boolean, default=False)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


# ─── Remediation Task ───────────────────────────────────
class RemediationTask(Base):
    __tablename__ = "remediation_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    task_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("discovery_findings.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(500))
    action: Mapped[str] = mapped_column(String(100))  # encrypt, mask, restrict, delete
    severity: Mapped[str] = mapped_column(String(50), default="medium")
    status: Mapped[str] = mapped_column(String(50), default="open")
    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    impact: Mapped[str | None] = mapped_column(Text, nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
