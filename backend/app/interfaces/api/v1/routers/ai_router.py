from __future__ import annotations

from fastapi import APIRouter, Depends
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
from app.models.user import User
from app.schemas.ai import CPAGenerationRequest, DifferentiationRequest, DifferentiationResponse

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
