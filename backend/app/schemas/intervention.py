from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


ALLOWED_EXERCISE_TIERS = {"foundation", "standard", "extension", "advanced"}


class GeneratePlanRequest(BaseModel):
    class_id: int
    week_number: int = Field(..., ge=1, le=53)
    year: int = Field(..., ge=2024, le=2035)


class ApprovePlanRequest(BaseModel):
    notes: str | None = None


class UpdateGroupRequest(BaseModel):
    suggested_activity: str | None = None
    suggested_exercises: dict[str, int] | None = None
    duration_minutes: int | None = Field(default=None, ge=5, le=120)
    notes: str | None = None

    @field_validator("suggested_exercises")
    @classmethod
    def validate_suggested_exercises(cls, value: dict[str, int] | None) -> dict[str, int] | None:
        if value is None:
            return value

        unknown_tiers = set(value) - ALLOWED_EXERCISE_TIERS
        if unknown_tiers:
            raise ValueError("Mức bài tập không hợp lệ")

        for count in value.values():
            if count < 0 or count > 50:
                raise ValueError("Số lượng bài tập phải từ 0 đến 50")

        return value


class LinkWorksheetRequest(BaseModel):
    worksheet_id: int = Field(..., ge=1)


class InterventionGroupResponse(BaseModel):
    id: int
    group_name: str
    error_type: str
    evidence: list[dict[str, Any]]
    suggested_activity: str
    suggested_exercises: dict[str, int]
    duration_minutes: int
    student_ids: list[int]
    student_names: list[str]
    worksheet_id: int | None
    order_index: int
    notes: str | None


class InterventionPlanResponse(BaseModel):
    id: int
    class_id: int
    class_name: str
    grade: Literal[1, 2, 3]
    week_number: int
    year: int
    status: Literal["draft", "approved", "completed"]
    notes: str | None
    groups: list[InterventionGroupResponse]
    total_students: int
    created_at: datetime
    approved_at: datetime | None


class InterventionPlanListItem(BaseModel):
    id: int
    week_number: int
    year: int
    status: Literal["draft", "approved", "completed"]
    total_groups: int
    total_students: int
    created_at: datetime
