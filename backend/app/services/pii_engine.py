"""
CompShield India-Native PII Intelligence Engine
------------------------------------------------
Hybrid detection: Regex → India-specific validators → Confidence score.
No raw PII is sent to external LLMs.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, asdict
from typing import List, Optional


# ─── Verhoeff algorithm (Aadhaar checksum) ───────────────
_VERHOEFF_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]
_VERHOEFF_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]


def verhoeff_validate(num: str) -> bool:
    """Validate number using Verhoeff checksum (used by Aadhaar)."""
    if not num.isdigit():
        return False
    c = 0
    for i, digit in enumerate(reversed(num)):
        c = _VERHOEFF_D[c][_VERHOEFF_P[i % 8][int(digit)]]
    return c == 0


def luhn_validate(num: str) -> bool:
    """Luhn algorithm for credit/debit cards."""
    digits = [int(d) for d in num if d.isdigit()]
    if len(digits) < 13 or len(digits) > 19:
        return False
    checksum = 0
    for i, d in enumerate(reversed(digits)):
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        checksum += d
    return checksum % 10 == 0


def mask_value(value: str, pii_type: str) -> str:
    """Return masked sample for safe display."""
    v = re.sub(r"\s|-", "", value)
    if pii_type == "aadhaar":
        return f"XXXX-XXXX-{v[-4:]}" if len(v) >= 4 else "XXXX"
    if pii_type == "pan":
        return f"{v[:5]}****{v[-1]}" if len(v) == 10 else "XXXXX****X"
    if pii_type == "credit_card":
        return f"****-****-****-{v[-4:]}" if len(v) >= 4 else "****"
    if pii_type == "phone":
        digits = re.sub(r"\D", "", v)
        return f"+91-******{digits[-4:]}" if len(digits) >= 4 else "****"
    if pii_type == "email":
        if "@" in value:
            local, domain = value.split("@", 1)
            return f"{local[0]}***@{domain}"
        return "***@***"
    if pii_type == "voter_id":
        return f"{v[:3]}****{v[-1]}" if len(v) >= 4 else "****"
    if pii_type == "gstin":
        return f"{v[:2]}**********{v[-1]}" if len(v) >= 3 else "****"
    return value[:2] + "***" + value[-2:] if len(value) > 4 else "***"


@dataclass
class PIIMatch:
    pii_type: str
    value_masked: str
    raw_length: int
    start: int
    end: int
    confidence: float
    severity: str  # low | medium | high | critical
    validator: str  # regex | checksum | luhn | format
    valid: bool
    category: str  # personal | sensitive (DPDP)


# ─── Patterns ───────────────────────────────────────────
# Aadhaar: 12 digits, optional spaces/dashes, not starting with 0/1
_AADHAAR_RE = re.compile(
    r"(?<!\d)([2-9](?:\s?-?\s?\d){11})(?!\d)"
)
# PAN: 5 letters + 4 digits + 1 letter
_PAN_RE = re.compile(r"\b([A-Z]{5}[0-9]{4}[A-Z])\b", re.IGNORECASE)
# Credit card: 13-19 digits with optional spaces/dashes
_CARD_RE = re.compile(
    r"(?<!\d)((?:\d[ -]?){13,19})(?!\d)"
)
# Indian mobile
_PHONE_RE = re.compile(
    r"(?:(?:\+91|0)[\s-]?)?([6-9]\d{9})\b"
)
# Email
_EMAIL_RE = re.compile(
    r"\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b"
)
# Voter ID (EPIC): 3 letters + 7 digits
_VOTER_RE = re.compile(r"\b([A-Z]{3}[0-9]{7})\b", re.IGNORECASE)
# GSTIN: 15 chars
_GSTIN_RE = re.compile(
    r"\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b", re.IGNORECASE
)
# IFSC: 4 letters + 0 + 6 alphanumeric
_IFSC_RE = re.compile(r"\b([A-Z]{4}0[A-Z0-9]{6})\b", re.IGNORECASE)
# UPI VPA
_UPI_RE = re.compile(r"\b([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64})\b")
# Driving License rough pattern
_DL_RE = re.compile(
    r"\b([A-Z]{2}[\s-]?\d{2}[\s-]?\d{4}[\s-]?\d{7})\b", re.IGNORECASE
)


def _severity(pii_type: str) -> str:
    critical = {"aadhaar", "credit_card"}
    high = {"pan", "voter_id", "gstin", "dl"}
    medium = {"phone", "email", "upi", "ifsc"}
    if pii_type in critical:
        return "critical"
    if pii_type in high:
        return "high"
    if pii_type in medium:
        return "medium"
    return "low"


def _category(pii_type: str) -> str:
    """DPDP: sensitive personal data vs personal data."""
    sensitive = {"aadhaar", "credit_card", "pan", "voter_id", "dl"}
    return "sensitive" if pii_type in sensitive else "personal"


def detect_pii(text: str) -> List[PIIMatch]:
    """
    Scan text and return all PII matches with confidence scores.
    Pipeline: Regex find → India validators → confidence.
    """
    if not text:
        return []

    matches: List[PIIMatch] = []
    seen_spans: set = set()

    def add(pii_type: str, raw: str, start: int, end: int, confidence: float, validator: str, valid: bool):
        span = (start, end)
        if span in seen_spans:
            return
        seen_spans.add(span)
        matches.append(
            PIIMatch(
                pii_type=pii_type,
                value_masked=mask_value(raw, pii_type),
                raw_length=len(re.sub(r"\s|-", "", raw)),
                start=start,
                end=end,
                confidence=round(confidence, 2),
                severity=_severity(pii_type),
                validator=validator,
                valid=valid,
                category=_category(pii_type),
            )
        )

    # Aadhaar
    for m in _AADHAAR_RE.finditer(text):
        raw = m.group(1)
        digits = re.sub(r"\D", "", raw)
        if len(digits) == 12:
            valid = verhoeff_validate(digits)
            conf = 0.98 if valid else 0.55
            add("aadhaar", digits, m.start(), m.end(), conf, "verhoeff", valid)

    # PAN
    for m in _PAN_RE.finditer(text):
        raw = m.group(1).upper()
        # 4th char is entity type: P=Individual, C=Company, etc.
        valid = len(raw) == 10 and raw[3] in "ABCFGHLJPTK"
        conf = 0.97 if valid else 0.70
        add("pan", raw, m.start(), m.end(), conf, "format", valid)

    # Credit / Debit card
    for m in _CARD_RE.finditer(text):
        raw = m.group(1)
        digits = re.sub(r"\D", "", raw)
        if 13 <= len(digits) <= 19:
            # Skip if it looks like Aadhaar already matched
            if len(digits) == 12:
                continue
            valid = luhn_validate(digits)
            conf = 0.95 if valid else 0.40
            if valid:
                add("credit_card", digits, m.start(), m.end(), conf, "luhn", True)

    # Phone
    for m in _PHONE_RE.finditer(text):
        raw = m.group(1)
        add("phone", raw, m.start(), m.end(), 0.93, "format", True)

    # Email
    for m in _EMAIL_RE.finditer(text):
        raw = m.group(1)
        # Avoid double-counting UPI-looking emails later
        add("email", raw, m.start(), m.end(), 0.99, "regex", True)

    # Voter ID
    for m in _VOTER_RE.finditer(text):
        raw = m.group(1).upper()
        add("voter_id", raw, m.start(), m.end(), 0.88, "format", True)

    # GSTIN
    for m in _GSTIN_RE.finditer(text):
        raw = m.group(1).upper()
        add("gstin", raw, m.start(), m.end(), 0.94, "format", True)

    # IFSC
    for m in _IFSC_RE.finditer(text):
        raw = m.group(1).upper()
        add("ifsc", raw, m.start(), m.end(), 0.96, "format", True)

    # UPI (exclude pure emails already captured)
    for m in _UPI_RE.finditer(text):
        raw = m.group(1)
        if "." in raw.split("@")[-1]:  # likely email domain
            continue
        add("upi", raw, m.start(), m.end(), 0.90, "format", True)

    # Driving License
    for m in _DL_RE.finditer(text):
        raw = re.sub(r"\s", "", m.group(1)).upper()
        add("dl", raw, m.start(), m.end(), 0.85, "format", True)

    # Sort by position
    matches.sort(key=lambda x: x.start)
    return matches


def detect_pii_summary(text: str) -> dict:
    """Full scan result with stats — for API response."""
    matches = detect_pii(text)
    by_type: dict = {}
    for m in matches:
        by_type.setdefault(m.pii_type, 0)
        by_type[m.pii_type] += 1

    return {
        "total_matches": len(matches),
        "by_type": by_type,
        "sensitive_count": sum(1 for m in matches if m.category == "sensitive"),
        "personal_count": sum(1 for m in matches if m.category == "personal"),
        "high_confidence": sum(1 for m in matches if m.confidence >= 0.9),
        "matches": [asdict(m) for m in matches],
        "engine": "CompShield India PII Intelligence v1.0",
        "validators": ["verhoeff", "luhn", "format", "regex"],
    }


def validate_single(pii_type: str, value: str) -> dict:
    """Validate a single value of a given type."""
    value = value.strip()
    digits = re.sub(r"\D", "", value)

    if pii_type == "aadhaar":
        ok = len(digits) == 12 and verhoeff_validate(digits)
        return {
            "pii_type": "aadhaar",
            "valid": ok,
            "masked": mask_value(digits, "aadhaar") if len(digits) >= 4 else None,
            "validator": "verhoeff",
            "message": "Valid Aadhaar checksum" if ok else "Invalid Aadhaar (checksum/format failed)",
        }

    if pii_type == "pan":
        v = value.upper().replace(" ", "")
        ok = bool(re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", v)) and v[3] in "ABCFGHLJPTK"
        return {
            "pii_type": "pan",
            "valid": ok,
            "masked": mask_value(v, "pan") if ok else None,
            "validator": "format",
            "message": "Valid PAN format" if ok else "Invalid PAN format",
        }

    if pii_type in ("credit_card", "card"):
        ok = luhn_validate(digits)
        return {
            "pii_type": "credit_card",
            "valid": ok,
            "masked": mask_value(digits, "credit_card") if len(digits) >= 4 else None,
            "validator": "luhn",
            "message": "Valid card number (Luhn)" if ok else "Invalid card (Luhn failed)",
        }

    if pii_type == "phone":
        ok = bool(re.fullmatch(r"[6-9]\d{9}", digits[-10:] if len(digits) >= 10 else digits))
        return {
            "pii_type": "phone",
            "valid": ok,
            "masked": mask_value(digits, "phone") if ok else None,
            "validator": "format",
            "message": "Valid Indian mobile" if ok else "Invalid Indian mobile number",
        }

    return {
        "pii_type": pii_type,
        "valid": False,
        "masked": None,
        "validator": "unknown",
        "message": f"Unsupported type: {pii_type}",
    }
