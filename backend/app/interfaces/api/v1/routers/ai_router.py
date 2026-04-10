from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict

from app.application.use_cases.ai.generate_cpa_draft import GenerateCPADraftUseCase
from app.application.use_cases.ai.generate_differentiation_draft import (
    GenerateDifferentiationDraftUseCase,
)
from app.bootstrap.container import (
    get_generate_cpa_draft_use_case,
    get_generate_differentiation_draft_use_case,
)
from app.core.dependencies import get_current_teacher
from app.database import get_db
from app.models.user import User
from app.schemas.ai import (
    AnalyticsSubmitRequest,
    AnalyticsSubmitResponse,
    CPAGenerationRequest,
    DifferentiationRequest,
    DifferentiationResponse,
)
from app.services.ai.analytics_service import AnalyticsService

router = APIRouter(prefix="/ai", tags=["AI v1"])


@router.post("/generate-cpa")
async def generate_cpa_worksheet_v1(
    request: CPAGenerationRequest,
    teacher: User = Depends(get_current_teacher),
    use_case: GenerateCPADraftUseCase = Depends(get_generate_cpa_draft_use_case),
) -> Dict:
    return use_case.execute(
        topic_id=request.topic_id,
        grade=request.grade,
        objective=request.objective,
        counts=request.counts,
    )


@router.post("/generate-differentiation", response_model=DifferentiationResponse)
async def generate_differentiation_worksheet_v1(
    request: DifferentiationRequest,
    teacher: User = Depends(get_current_teacher),
    use_case: GenerateDifferentiationDraftUseCase = Depends(
        get_generate_differentiation_draft_use_case
    ),
) -> Dict:
    return use_case.execute(
        topic_id=request.topic_id,
        grade=request.grade,
        objective=request.objective,
        tiers=request.tiers,
    )


@router.post("/analytics/submit", response_model=AnalyticsSubmitResponse)
async def submit_analytics_tags_v1(
    request: AnalyticsSubmitRequest,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
) -> AnalyticsSubmitResponse:
    service = AnalyticsService(db)
    try:
        created = service.submit_reviewed_error_tags(
            class_id=request.class_id,
            teacher_id=teacher.id,
            student_id=request.student_id,
            worksheet_id=request.worksheet_id,
            source=request.source,
            error_tags=[tag.model_dump() for tag in request.error_tags],
        )
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except LookupError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return AnalyticsSubmitResponse(
        message="Da luu thong tin loi cho dashboard",
        records_created=created,
    )
