from __future__ import annotations

from fastapi import APIRouter, Depends
from typing import cast

from app.application.use_cases.worksheet.publish_worksheet import PublishWorksheetUseCase
from app.bootstrap.container import get_publish_worksheet_use_case
from app.core.dependencies import get_current_teacher
from app.models.user import User
from app.schemas.worksheet import WorksheetResponse

router = APIRouter(prefix="/worksheets", tags=["Worksheets v1"])


@router.post("/{worksheet_id}/publish", response_model=WorksheetResponse)
async def publish_worksheet_v1(
    worksheet_id: int,
    teacher: User = Depends(get_current_teacher),
    use_case: PublishWorksheetUseCase = Depends(get_publish_worksheet_use_case),
):
    worksheet = use_case.execute(
        worksheet_id=worksheet_id,
        teacher_id=cast(int, teacher.id),
    )

    return WorksheetResponse(
        id=worksheet.id,
        title=worksheet.title,
        class_id=worksheet.class_id,
        topic_id=worksheet.topic_id,
        grade=worksheet.grade,
        difficulty=worksheet.difficulty,
        status=worksheet.status,
        worksheet_type=worksheet.worksheet_type,
        objective=worksheet.objective,
        created_at=worksheet.created_at,
        published_at=worksheet.published_at,
        exercise_count=len(worksheet.exercises),
    )
