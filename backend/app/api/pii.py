from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from app.api.deps import get_current_user
from app.models.user import User
from app.services.pii_engine import detect_pii_summary, validate_single

router = APIRouter(prefix="/pii", tags=["PII Intelligence Engine"])


class ScanRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=100_000, description="Text to scan for PII")


class ValidateRequest(BaseModel):
    pii_type: str = Field(..., description="aadhaar | pan | credit_card | phone")
    value: str = Field(..., min_length=1, max_length=64)


class BatchValidateItem(BaseModel):
    pii_type: str
    value: str


class BatchValidateRequest(BaseModel):
    items: List[BatchValidateItem] = Field(..., max_length=100)


@router.post("/scan")
def scan_text(
    payload: ScanRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Scan free text for India-specific PII.
    Returns masked values only — raw PII never stored or logged.
    """
    return detect_pii_summary(payload.text)


@router.post("/validate")
def validate_pii(
    payload: ValidateRequest,
    current_user: User = Depends(get_current_user),
):
    """Validate a single Aadhaar / PAN / Card / Phone value."""
    supported = {"aadhaar", "pan", "credit_card", "card", "phone"}
    if payload.pii_type.lower() not in supported:
        raise HTTPException(
            status_code=400,
            detail=f"Supported types: {', '.join(sorted(supported))}",
        )
    return validate_single(payload.pii_type.lower(), payload.value)


@router.post("/validate/batch")
def validate_batch(
    payload: BatchValidateRequest,
    current_user: User = Depends(get_current_user),
):
    """Validate multiple values in one call."""
    results = []
    for item in payload.items:
        results.append(validate_single(item.pii_type.lower(), item.value))
    return {
        "total": len(results),
        "valid_count": sum(1 for r in results if r.get("valid")),
        "results": results,
    }


@router.get("/types")
def list_pii_types(current_user: User = Depends(get_current_user)):
    """Supported PII types and validators."""
    return {
        "engine": "CompShield India PII Intelligence v1.0",
        "types": [
            {"id": "aadhaar", "name": "Aadhaar", "validator": "Verhoeff checksum", "severity": "critical", "category": "sensitive"},
            {"id": "pan", "name": "PAN", "validator": "Format + entity type", "severity": "high", "category": "sensitive"},
            {"id": "credit_card", "name": "Credit/Debit Card", "validator": "Luhn algorithm", "severity": "critical", "category": "sensitive"},
            {"id": "phone", "name": "Indian Mobile", "validator": "Format (6-9 start)", "severity": "medium", "category": "personal"},
            {"id": "email", "name": "Email", "validator": "Regex", "severity": "medium", "category": "personal"},
            {"id": "voter_id", "name": "Voter ID (EPIC)", "validator": "Format", "severity": "high", "category": "sensitive"},
            {"id": "gstin", "name": "GSTIN", "validator": "Format", "severity": "high", "category": "personal"},
            {"id": "ifsc", "name": "IFSC Code", "validator": "Format", "severity": "medium", "category": "personal"},
            {"id": "upi", "name": "UPI VPA", "validator": "Format", "severity": "medium", "category": "personal"},
            {"id": "dl", "name": "Driving License", "validator": "Format", "severity": "high", "category": "sensitive"},
        ],
    }


class DocumentScanRequest(BaseModel):
    text: str = Field(default="", max_length=200_000)
    filename: Optional[str] = None
    source_engine: str = Field(default="hybrid")
    document_type: Optional[str] = None


@router.post("/scan/document")
def scan_document(payload: DocumentScanRequest, current_user: User = Depends(get_current_user)):
    """Hybrid: Regex/validators on text or OCR-extracted text. Raw PII never stored."""
    text = payload.text or ""
    hint = (payload.filename or "") + " " + (payload.document_type or "")
    combined = text if text.strip() else hint
    summary = detect_pii_summary(combined if combined.strip() else " ")
    engines = []
    if payload.source_engine in ("regex", "hybrid"):
        engines.append("regex+validator")
    if payload.source_engine in ("ocr", "hybrid"):
        engines.append("ocr-text-layer")
    return {
        "filename": payload.filename,
        "document_type": payload.document_type,
        "engines": engines,
        "pipeline": "OCR extract → India PII validators → mask → findings",
        "note": "Production: attach Tesseract/cloud OCR; demo uses OCR text paste + validators.",
        **summary,
    }
