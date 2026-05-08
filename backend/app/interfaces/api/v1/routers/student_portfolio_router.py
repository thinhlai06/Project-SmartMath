from __future__ import annotations

from dataclasses import asdict
from typing import cast

from fastapi import APIRouter, Depends

from app.application.use_cases.get_class_student_portfolios import GetClassStudentPortfoliosUseCase
from app.application.use_cases.get_student_portfolio_detail import GetStudentPortfolioDetailUseCase
from app.bootstrap.container import (
    get_class_student_portfolios_use_case,
    get_student_portfolio_detail_use_case,
)
from app.core.dependencies import get_current_teacher
from app.interfaces.api.v1.schemas.student_portfolio import (
    ClassStudentPortfoliosResponse,
    StudentPortfolioDetailResponse,
)
from app.models.user import User

router = APIRouter(prefix="/classes", tags=["Student Portfolios v1"])


@router.get("/{class_id}/student-portfolios", response_model=ClassStudentPortfoliosResponse)
async def get_class_student_portfolios(
    class_id: int,
    teacher: User = Depends(get_current_teacher),
    use_case: GetClassStudentPortfoliosUseCase = Depends(get_class_student_portfolios_use_case),
):
    result = use_case.execute(class_id=class_id, teacher_id=cast(int, teacher.id))
    return asdict(result)


@router.get("/{class_id}/students/{student_id}/portfolio", response_model=StudentPortfolioDetailResponse)
async def get_student_portfolio_detail(
    class_id: int,
    student_id: int,
    teacher: User = Depends(get_current_teacher),
    use_case: GetStudentPortfolioDetailUseCase = Depends(get_student_portfolio_detail_use_case),
):
    result = use_case.execute(class_id=class_id, student_id=student_id, teacher_id=cast(int, teacher.id))
    return asdict(result)
