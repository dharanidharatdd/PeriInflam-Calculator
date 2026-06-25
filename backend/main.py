from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, Literal

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

LOGGER = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]

app = FastAPI(title="PERIOMETRIX API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExtractRequest(BaseModel):
    text: str = Field(..., min_length=20, max_length=120_000)


class CBCValues(BaseModel):
    rbc: float | None = None
    wbc: float | None = None
    hemoglobin: float | None = None
    platelets: float | None = None
    neutrophils: float | None = None
    lymphocytes: float | None = None
    monocytes: float | None = None
    hba1c: float | None = None


class ExtractResponse(CBCValues):
    source: Literal["gemini", "fallback"] = "gemini"


class ValidateRequest(CBCValues):
    pass


class ValidateResponse(CBCValues):
    warnings: list[str] = []
    source: Literal["server"] = "server"


def _normalize_number(value: Any) -> float | None:
    if value is None:
        return None

    if isinstance(value, bool):
        return None

    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        match = re.search(r"-?\d+(?:\.\d+)?", value.replace(",", ""))
        if match:
            try:
                return float(match.group(0))
            except ValueError:
                return None

    return None


def _parse_json_block(text: str) -> dict[str, Any]:
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No JSON object found in Gemini response")
    return json.loads(match.group(0))


def _fallback_extract(text: str) -> dict[str, float | None]:
    patterns = {
        "rbc": r"(?:^|\b)rbc\b[^\d-]*([0-9]+(?:\.[0-9]+)?)",
        "wbc": r"(?:^|\b)wbc\b[^\d-]*([0-9]+(?:\.[0-9]+)?)",
        "hemoglobin": r"(?:^|\b)(?:hb|hemoglobin)\b[^\d-]*([0-9]+(?:\.[0-9]+)?)",
        "platelets": r"(?:^|\b)(?:plt|platelets)\b[^\d-]*([0-9]+(?:\.[0-9]+)?)",
        "neutrophils": r"(?:^|\b)neutrophils?\b[^\d-]*([0-9]+(?:\.[0-9]+)?)",
        "lymphocytes": r"(?:^|\b)lymphocytes?\b[^\d-]*([0-9]+(?:\.[0-9]+)?)",
        "monocytes": r"(?:^|\b)monocytes?\b[^\d-]*([0-9]+(?:\.[0-9]+)?)",
        "hba1c": r"(?:^|\b)hba1c\b[^\d-]*([0-9]+(?:\.[0-9]+)?)",
    }

    extracted: dict[str, float | None] = {}
    lower_text = text.lower()
    for key, pattern in patterns.items():
        match = re.search(pattern, lower_text, flags=re.IGNORECASE)
        extracted[key] = float(match.group(1)) if match else None
    return extracted


def _build_warnings(values: CBCValues) -> list[str]:
    warnings: list[str] = []
    if values.rbc is not None and not (3.5 <= values.rbc <= 5.5):
        warnings.append("RBC is outside the usual reference range (3.5-5.5)")
    if values.wbc is not None and not (4.5 <= values.wbc <= 11.0):
        warnings.append("WBC is outside the usual reference range (4.5-11.0)")
    if values.hemoglobin is not None and not (12.0 <= values.hemoglobin <= 18.0):
        warnings.append("Hemoglobin is outside the usual reference range (12.0-18.0)")
    if values.platelets is not None and not (150.0 <= values.platelets <= 400.0):
        warnings.append("Platelets are outside the usual reference range (150-400)")
    if values.neutrophils is not None and not (40.0 <= values.neutrophils <= 75.0):
        warnings.append("Neutrophils are outside the usual percentage range (40-75)")
    if values.lymphocytes is not None and not (20.0 <= values.lymphocytes <= 50.0):
        warnings.append("Lymphocytes are outside the usual percentage range (20-50)")
    if values.monocytes is not None and not (2.0 <= values.monocytes <= 10.0):
        warnings.append("Monocytes are outside the usual percentage range (2-10)")
    if values.hba1c is not None and not (4.0 <= values.hba1c <= 14.0):
        warnings.append("HbA1c looks outside a typical reporting range")
    return warnings


async def _call_gemini(text: str) -> dict[str, Any]:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured")

    prompt = (
        "You are a medical data extraction system. Extract the CBC values from the text below. "
        "Return only valid JSON with exactly these keys: rbc, wbc, hemoglobin, platelets, neutrophils, lymphocytes, monocytes, hba1c. "
        "Use null for missing values. Do not add any extra text.\n\n"
        f"TEXT:\n{text}"
    )

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0,
            "responseMimeType": "application/json",
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            GEMINI_API_URL,
            params={"key": GEMINI_API_KEY},
            json=payload,
        )

    if response.status_code == 429:
        raise HTTPException(status_code=503, detail="Gemini quota exhausted or rate limited")

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    data = response.json()
    candidates = data.get("candidates") or []
    if not candidates:
        raise ValueError("No candidates in Gemini response")

    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    if not parts:
        raise ValueError("No parts in Gemini response")

    response_text = parts[0].get("text", "")
    parsed = _parse_json_block(response_text)
    return parsed


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/extract-cbc", response_model=ExtractResponse)
async def extract_cbc(payload: ExtractRequest) -> ExtractResponse:
    text = payload.text.strip()
    if len(text) < 20:
        raise HTTPException(status_code=400, detail="Extracted text is too short")

    try:
        parsed = await _call_gemini(text)
        return ExtractResponse(
            rbc=_normalize_number(parsed.get("rbc")),
            wbc=_normalize_number(parsed.get("wbc")),
            hemoglobin=_normalize_number(parsed.get("hemoglobin")),
            platelets=_normalize_number(parsed.get("platelets")),
            neutrophils=_normalize_number(parsed.get("neutrophils")),
            lymphocytes=_normalize_number(parsed.get("lymphocytes")),
            monocytes=_normalize_number(parsed.get("monocytes")),
            hba1c=_normalize_number(parsed.get("hba1c")),
            source="gemini",
        )
    except HTTPException:
        raise
    except Exception as exc:
        LOGGER.exception("Gemini extraction failed")
        fallback = _fallback_extract(text)
        if any(value is not None for value in fallback.values()):
            return ExtractResponse(**fallback, source="fallback")
        raise HTTPException(status_code=502, detail=f"Extraction failed: {exc}") from exc


@app.post("/api/validate-cbc", response_model=ValidateResponse)
def validate_cbc(payload: ValidateRequest) -> ValidateResponse:
    warnings = _build_warnings(payload)
    return ValidateResponse(**payload.model_dump(), warnings=warnings, source="server")
