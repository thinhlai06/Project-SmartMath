from __future__ import annotations

from fastapi import HTTPException
from typing import cast

from app.domain.repositories.class_repository import ClassRepository
from app.domain.repositories.worksheet_repository import WorksheetRepository


class PublishWorksheetUseCase:
    """Publish worksheet with teacher ownership and business-rule checks."""

    def __init__(
        self,
        worksheet_repository: WorksheetRepository,
        class_repository: ClassRepository,
    ):
        self.worksheet_repository = worksheet_repository
        self.class_repository = class_repository

    def execute(self, worksheet_id: int, teacher_id: int):
        worksheet = self.worksheet_repository.get_by_id(worksheet_id)
        if not worksheet:
            raise HTTPException(status_code=404, detail="Bai tap khong ton tai")

        owns_class = self.class_repository.teacher_owns_class(
            class_id=cast(int, worksheet.class_id),
            teacher_id=teacher_id,
        )
        if not owns_class:
            raise HTTPException(status_code=403, detail="Ban khong co quyen truy cap bai tap nay")

        if len(worksheet.exercises) == 0:
            raise HTTPException(
                status_code=400,
                detail="Khong the xuat ban bai tap khong co cau hoi nao.",
            )

        return self.worksheet_repository.publish(worksheet)
