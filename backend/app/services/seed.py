"""Seed demo users + sample compliance data for client demos."""
from datetime import datetime, timezone, date, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, Organization
from app.models.entities import (
    DSARRequest,
    ConsentRecord,
    DataSource,
    DiscoveryFinding,
    ROPAEntry,
    RemediationTask,
)
from app.core.config import settings


def seed_demo_user(db: Session) -> None:
    if not settings.SEED_DEMO_USER:
        return

    email = "admin@compshield.com"
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        _seed_entities(db, existing.organization_id)
        return

    org = Organization(
        name="Acme Technologies Pvt Ltd",
        industry="Technology",
        dpo_name="Rahul Verma",
        dpo_email="dpo@acme.com",
        address="P4 502 Pentagon Towers, Magarpatta, Pune, Maharashtra 411028",
    )
    db.add(org)
    db.flush()

    user = User(
        email=email,
        hashed_password=get_password_hash("demo123"),
        full_name="Admin User",
        role="admin",
        organization_id=org.id,
        is_active=True,
    )
    db.add(user)
    db.add(
        User(
            email="demo@compshield.com",
            hashed_password=get_password_hash("demo123"),
            full_name="Demo User",
            role="analyst",
            organization_id=org.id,
            is_active=True,
        )
    )
    db.commit()
    print("Demo users seeded: admin@compshield.com / demo123")
    _seed_entities(db, org.id)


def _seed_entities(db: Session, org_id) -> None:
    if not org_id:
        return
    if db.query(DSARRequest).filter(DSARRequest.organization_id == org_id).count() > 0:
        return

    today = date.today()

    dsars = [
        ("DSAR-2026-0001", "access", "pending", "Priya Sharma", "priya.sharma@email.com", "Rahul Verma"),
        ("DSAR-2026-0002", "erasure", "in_progress", "Amit Patel", "amit.patel@company.in", "Sneha Kapoor"),
        ("DSAR-2026-0003", "correction", "completed", "Neha Gupta", "neha.g@gmail.com", "Rahul Verma"),
        ("DSAR-2026-0004", "access", "pending", "Vikram Singh", "vikram.s@outlook.com", None),
        ("DSAR-2026-0005", "portability", "in_progress", "Ananya Reddy", "ananya.r@yahoo.com", "Sneha Kapoor"),
    ]
    for rid, rtype, status, name, email, assigned in dsars:
        db.add(
            DSARRequest(
                request_id=rid,
                request_type=rtype,
                status=status,
                principal_name=name,
                principal_email=email,
                assigned_to=assigned,
                due_date=today + timedelta(days=14),
                organization_id=org_id,
            )
        )

    consents = [
        ("Priya Sharma", "priya.sharma@email.com", "Marketing Communications", "email", "active"),
        ("Amit Patel", "amit.patel@company.in", "Product Analytics", "app", "active"),
        ("Neha Gupta", "neha.g@gmail.com", "Third-party Sharing", "website", "withdrawn"),
        ("Vikram Singh", "vikram.s@outlook.com", "Marketing Communications", "sms", "active"),
        ("Rohan Mehta", "rohan.mehta@email.com", "Personalization", "app", "active"),
    ]
    for name, email, purpose, channel, status in consents:
        c = ConsentRecord(
            principal_name=name,
            principal_email=email,
            purpose=purpose,
            channel=channel,
            status=status,
            notice_version="v1.0",
            organization_id=org_id,
        )
        if status == "withdrawn":
            c.withdrawn_at = datetime.now(timezone.utc)
        db.add(c)

    sources = [
        ("HR Database (PostgreSQL)", "database", "completed", 12450, 320),
        ("Customer CRM (Salesforce)", "saas", "completed", 45680, 890),
        ("AWS S3 – Customer Docs", "cloud", "pending", 0, 0),
        ("Support Tickets (Zendesk)", "saas", "completed", 18760, 210),
    ]
    source_ids = []
    for name, stype, status, records, pii in sources:
        s = DataSource(
            name=name,
            source_type=stype,
            status=status,
            records_found=records,
            pii_count=pii,
            last_scanned=datetime.now(timezone.utc) if status == "completed" else None,
            organization_id=org_id,
        )
        db.add(s)
        db.flush()
        source_ids.append(s.id)

    findings = [
        (source_ids[0], "aadhaar", "employees.aadhaar_number", "XXXX-XXXX-1234", 0.98, "high"),
        (source_ids[0], "pan", "employees.pan", "ABCDE****F", 0.97, "high"),
        (source_ids[1], "email", "contacts.email", "u***@email.com", 0.99, "medium"),
        (source_ids[1], "phone", "contacts.phone", "+91-****3210", 0.95, "medium"),
        (source_ids[3], "credit_card", "payments.card_last4", "****-4242", 0.92, "high"),
    ]
    for sid, pii, loc, masked, conf, sev in findings:
        db.add(
            DiscoveryFinding(
                source_id=sid,
                pii_type=pii,
                location=loc,
                sample_masked=masked,
                confidence=conf,
                severity=sev,
                status="open",
                organization_id=org_id,
            )
        )

    for name, purpose, cats, basis in [
        ("Employee Onboarding", "HR administration and payroll", "Name, Aadhaar, PAN, Bank", "employment"),
        ("Marketing Campaigns", "Product offers and newsletters", "Name, Email, Phone", "consent"),
        ("Customer Support", "Ticket resolution and quality", "Name, Email, Call recordings", "legitimate_use"),
    ]:
        db.add(
            ROPAEntry(
                activity_name=name,
                purpose=purpose,
                legal_basis=basis,
                data_categories=cats,
                data_subjects="employees" if "Employee" in name else "customers",
                retention_period="3 years",
                cross_border=False,
                organization_id=org_id,
            )
        )

    for i, (title, action, sev, status) in enumerate(
        [
            ("Unencrypted Aadhaar in HR DB", "encrypt", "high", "open"),
            ("PAN in plain PDF on S3", "mask", "high", "in_progress"),
            ("Withdrawn consents still in campaign list", "restrict", "medium", "open"),
            ("Card numbers without tokenization", "encrypt", "high", "completed"),
        ],
        start=1,
    ):
        t = RemediationTask(
            task_id=f"REM-{i:03d}",
            title=title,
            action=action,
            severity=sev,
            status=status,
            source="Data Discovery",
            impact="DPDP sensitive personal data exposure risk",
            organization_id=org_id,
        )
        if status == "completed":
            t.completed_at = datetime.now(timezone.utc)
        db.add(t)

    db.commit()
    print("Demo compliance data seeded")
