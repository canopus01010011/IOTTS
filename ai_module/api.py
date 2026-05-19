"""
FastAPI wrapper for images_check.py
------------------------------------
Exposes POST /validate-photo so the TypeScript AIService can call it.
Imports functions from images_check.py directly — no logic is duplicated.

Expected request  : multipart/form-data  field name = "photo"
Response shape    : matches AIValidationResponse in the TypeScript client
    {
        valid           : boolean
        score           : number   (0-1)
        issues          : string[]
        blur_score      : number
        brightness_score: number
        resolution      : { width: number, height: number }
    }
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Annotated

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel


from images_ckeck import (
    EQUIPMENT_SCORE_THRESHOLD,
    analyze_quality,
    load_clip_model,
    run_equipment_detection,
)

logger = logging.getLogger("api")

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
MAX_FILE_SIZE_MB = 20




_model = None
_processor = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _model, _processor
    logger.info("Loading CLIP model ...")
    _model, _processor = load_clip_model()   
    logger.info("Model ready.")
    yield
    _model = None
    _processor = None


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Image Validator",
    description="Wraps images_check.py and exposes it over HTTP for the TypeScript AIService",
    version="1.0.0",
    lifespan=lifespan,
)



class Resolution(BaseModel):
    width: int
    height: int


class ClipResult(BaseModel):
    accepted: bool
    equipment_score: float
    best_label: str
    best_score: float


class ValidationResponse(BaseModel):
    valid: bool
    score: float
    issues: list[str]
    blur_score: float
    brightness_score: float
    resolution: Resolution
    clip: ClipResult



@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/validate-photo", response_model=ValidationResponse)
async def validate_photo(
    photo: Annotated[UploadFile, File(description="Image file to validate")],
):
    # -- guards --------------------------------------------------------------
    if photo.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported type '{photo.content_type}'. Allowed: {sorted(ALLOWED_CONTENT_TYPES)}",
        )

    raw = await photo.read()

    if len(raw) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_FILE_SIZE_MB} MB.")

    # -- decode bytes -> OpenCV BGR array ------------------------------------
    arr = np.frombuffer(raw, dtype=np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=422, detail="Could not decode image data.")

    h, w = image.shape[:2]

    # -- reuse images_check functions directly --------------------------------
    quality = analyze_quality(image)           # -> QualityReport
    if quality.blur_label == "Blurry":
        issues = [
        f"Image quality: {quality.blur_label} (score {quality.laplacian_var:.1f})"
    ]

        return ValidationResponse(
            valid=False,
            score=0.0,
            issues=issues,
            blur_score=round(quality.laplacian_var, 2),
            brightness_score=round(quality.brightness, 2),
            resolution=Resolution(width=w, height=h),
            clip=ClipResult(
                accepted=False,
                equipment_score=0.0,
                best_label="CLIP skipped",
                best_score=0.0,
            ),
        )

    if quality.brightness_label != "Good":
        issues = [
            f"Lighting: {quality.brightness_label} (brightness {quality.brightness:.1f})"
        ]

        return ValidationResponse(
            valid=False,
            score=0.0,
            issues=issues,
            blur_score=round(quality.laplacian_var, 2),
            brightness_score=round(quality.brightness, 2),
            resolution=Resolution(width=w, height=h),
            clip=ClipResult(
                accepted=False,
                equipment_score=0.0,
                best_label="CLIP skipped",
                best_score=0.0,
            ),
        )

    detection = run_equipment_detection(       # -> DetectionResult
        image, _model, _processor
    )

    # -- collect issues ---------------------------------------
    issues: list[str] = []

    if quality.blur_label != "Sharp":
        issues.append(f"Image quality: {quality.blur_label} (score {quality.laplacian_var:.1f})")

    if quality.brightness_label != "Good":
        issues.append(f"Lighting: {quality.brightness_label} (brightness {quality.brightness:.1f})")

    if not detection.accepted:
        issues.append(
            f"No network equipment detected "
            f"(equipment score {detection.equipment_score:.1%}, "
            f"best match: '{detection.best_label}' at {detection.best_score:.1%})"
        )

    # -- overall score: blend quality + equipment confidence -----------------
    quality_score = (
        1.0 if quality.blur_label == "Sharp" and quality.brightness_label == "Good"
        else 0.5 if quality.blur_label == "Slightly Blurry"
        else 0.0
    )
    score = round(0.4 * quality_score + 0.6 * detection.equipment_score, 4)

    return ValidationResponse(
        valid=len(issues) == 0,
        score=score,
        issues=issues,
        blur_score=round(quality.laplacian_var, 2),
        brightness_score=round(quality.brightness, 2),
        resolution=Resolution(width=w, height=h),
        clip=ClipResult(
            accepted=detection.accepted,
            equipment_score=round(detection.equipment_score, 4),
            best_label=detection.best_label,
            best_score=round(detection.best_score, 4),
        ),
    )