"""Seed demo data for development and demos."""
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, Organization
from app.core.config import settings


def seed_demo_user(db: Session) -> None:
    if not settings.SEED_DEMO_USER:
        return

    email = "admin@compshield.com"
    existing = db.query(User).filter(User.email == email).first()
    if existing:
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

    # Second demo user
    demo = User(
        email="demo@compshield.com",
        hashed_password=get_password_hash("demo123"),
        full_name="Demo User",
        role="analyst",
        organization_id=org.id,
        is_active=True,
    )
    db.add(demo)
    db.commit()
    print("✅ Demo users seeded: admin@compshield.com / demo123")
