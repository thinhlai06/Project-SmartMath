from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Literal

ProgressStatus = Literal["no_data", "improving", "stable", "needs_monitoring", "at_risk"]
ScoreSource = Literal["none", "grade_entry", "student_progress", "mixed"]
GradeLevel = Literal[1, 2, 3]


class RepeatedMistakeResponse(BaseModel):
    error_type: str
    count: int
    latest_detail: str | None = None


class ScoreTrendPointResponse(BaseModel):
    worksheet_id: int
    worksheet_title: str
    date: str
    score: float
    max_score: float = 10.0
    score_source: ScoreSource


class RecentWorksheetResponse(BaseModel):
    worksheet_id: int
    worksheet_title: str
    date: str
    score: float
    max_score: float = 10.0
    score_source: ScoreSource


class RecentErrorResponse(BaseModel):
    error_type: str
    error_detail: str | None = None
    question_text: str | None = None
    created_at: str


class PortfolioRecommendationResponse(BaseModel):
    title: str
    description: str
    is_draft: bool = True


class StudentPortfolioCardResponse(BaseModel):
    student_id: int
    student_name: str
    tier: str | None = None
    average_score: float
    class_average_score: float
    progress_status: ProgressStatus
    progress_status_label: str
    total_worksheets: int
    total_error_records: int
    latest_activity: str | None = None
    top_repeated_mistake: RepeatedMistakeResponse | None = None
    data_quality: list[str] = Field(default_factory=list)
    score_source: ScoreSource


class ClassStudentPortfoliosResponse(BaseModel):
    class_id: int
    class_name: str
    grade: GradeLevel
    students: list[StudentPortfolioCardResponse]


class StudentPortfolioDetailResponse(BaseModel):
    student_id: int
    student_name: str
    tier: str | None = None
    average_score: float
    class_average_score: float
    progress_status: ProgressStatus
    progress_status_label: str
    total_worksheets: int
    total_error_records: int
    score_trend: list[ScoreTrendPointResponse]
    repeated_mistakes: list[RepeatedMistakeResponse]
    recent_worksheets: list[RecentWorksheetResponse]
    recent_errors: list[RecentErrorResponse]
    recommendations: list[PortfolioRecommendationResponse]
    data_quality: list[str] = Field(default_factory=list)
    score_source: ScoreSource
