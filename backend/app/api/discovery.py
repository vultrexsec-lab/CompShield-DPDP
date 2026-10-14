
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.entities import DataSource, DiscoveryFinding
from app.schemas.entities import DataSourceCreate, DataSourceResponse, FindingResponse

router = APIRouter(prefix="/discovery", tags=["Data Discovery"])

# Demo catalog mimicking banking_finance_classification / customer_data
DEMO_CATALOG = {
    "banking_finance_classification": {
        "customer_data": [
            "customer_id", "full_name", "date_of_birth", "gender", "marital_status",
            "aadhaar_number", "pan_number", "email", "phone_number", "address",
            "city", "state", "pincode", "credit_card_number", "card_expiry", "card_cvv",
            "bank_account_number", "ifsc_code", "account_type", "account_balance",
            "monthly_salary", "annual_income", "loan_type", "loan_amount", "loan_emi",
            "credit_score", "employment_type", "blood_group", "medical_condition",
            "insurance_policy_id", "nominee_name", "kyc_status", "account_status",
            "date_joined", "last_transaction_date", "ip_address",
        ],
        "export_finance": [
            "export_id", "customer_id", "amount", "currency", "pan_number", "gstin",
        ],
        "factoring": [
            "factor_id", "client_name", "invoice_amount", "aadhaar_number", "email",
        ],
    },
    "hr_payroll": {
        "employees": [
            "emp_id", "full_name", "email", "phone", "aadhaar_number", "pan_number",
            "bank_account", "ifsc", "salary", "department",
        ],
        "attendance": ["emp_id", "date", "check_in", "check_out", "location"],
    },
}

PII_COLUMN_HINTS = {
    "aadhaar_number": ("aadhaar", "XXXX-XXXX-1234", 0.98, "critical"),
    "pan_number": ("pan", "ABCDE****F", 0.97, "high"),
    "credit_card_number": ("credit_card", "****-****-****-4242", 0.95, "critical"),
    "card_cvv": ("credit_card", "***", 0.90, "critical"),
    "email": ("email", "u***@email.com", 0.99, "medium"),
    "phone_number": ("phone", "+91-****3210", 0.95, "medium"),
    "phone": ("phone", "+91-****3210", 0.95, "medium"),
    "bank_account_number": ("bank_account", "********1234", 0.92, "high"),
    "bank_account": ("bank_account", "********1234", 0.92, "high"),
    "ifsc_code": ("ifsc", "HDFC0******", 0.96, "medium"),
    "ifsc": ("ifsc", "HDFC0******", 0.96, "medium"),
    "full_name": ("name", "R*** S****", 0.85, "low"),
    "ip_address": ("ip", "103.***.***.12", 0.88, "medium"),
    "gstin": ("gstin", "27******1Z5", 0.94, "high"),
}


class DataSourceWizardIn(BaseModel):
    name: str
    source_type: str = "database"
    connection_info: Optional[str] = None
    host: Optional[str] = None
    db_engine: Optional[str] = "postgresql"
    schema_name: Optional[str] = None
    selected_tables: Optional[str] = None
    selected_columns: Optional[str] = None
    onboarding_stage: int = 5
    status: str = "pending"


@router.get("/catalog")
def get_catalog(current_user: User = Depends(get_current_user)):
    """Demo schema/table/column tree for scope selection."""
    return {"schemas": DEMO_CATALOG, "engines": ["postgresql", "mysql", "sqlserver", "mongodb", "snowflake"]}


@router.get("/sources", response_model=List[DataSourceResponse])
def list_sources(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(DataSource)
    if current_user.organization_id:
        q = q.filter(DataSource.organization_id == current_user.organization_id)
    return q.order_by(DataSource.created_at.desc()).all()


@router.post("/sources", response_model=DataSourceResponse, status_code=status.HTTP_201_CREATED)
def create_source(
    payload: DataSourceWizardIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = DataSource(
        name=payload.name,
        source_type=payload.source_type,
        connection_info=payload.connection_info,
        host=payload.host,
        db_engine=payload.db_engine,
        schema_name=payload.schema_name,
        selected_tables=payload.selected_tables,
        selected_columns=payload.selected_columns,
        onboarding_stage=payload.onboarding_stage,
        status=payload.status or "pending",
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
    source = db.query(DataSource).filter(DataSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    source.status = "completed"
    source.last_scanned = datetime.now(timezone.utc)

    cols = []
    if source.selected_columns:
        cols = [c.strip() for c in source.selected_columns.replace(";", ",").split(",") if c.strip()]
    if not cols:
        # default sample
        cols = list(PII_COLUMN_HINTS.keys())[:8]

    table = "customer_data"
    if source.selected_tables:
        table = source.selected_tables.split(",")[0].strip() or table
    schema = source.schema_name or "banking_finance_classification"

    findings_count = 0
    for col in cols:
        key = col.lower()
        hint = PII_COLUMN_HINTS.get(key)
        if not hint:
            # fuzzy
            for k, v in PII_COLUMN_HINTS.items():
                if k in key or key in k:
                    hint = v
                    break
        if not hint:
            continue
        pii_type, masked, conf, sev = hint
        db.add(
            DiscoveryFinding(
                source_id=source.id,
                pii_type=pii_type,
                location=f"{schema}.{table}.{col}",
                sample_masked=masked,
                confidence=conf,
                severity=sev,
                status="open",
                organization_id=current_user.organization_id,
            )
        )
        findings_count += 1

    source.records_found = max(1000, findings_count * 120)
    source.pii_count = findings_count
    db.commit()
    db.refresh(source)
    return source


@router.get("/findings", response_model=List[FindingResponse])
def list_findings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(DiscoveryFinding)
    if current_user.organization_id:
        q = q.filter(DiscoveryFinding.organization_id == current_user.organization_id)
    return q.order_by(DiscoveryFinding.created_at.desc()).all()
