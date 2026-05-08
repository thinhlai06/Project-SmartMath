from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

ProgressStatus = Literal["no_data", "improving", "stable", "needs_monitoring", "at_risk"]
ScoreSource = Literal["none", "grade_entry", "student_progress", "mixed"]


@dataclass(frozen=True)
class ProgressClassification:
    status: ProgressStatus
    label: str


@dataclass(frozen=True)
class ScoreTrendPoint:
    worksheet_id: int
    worksheet_title: str
    date: str
    score: float
    max_score: float = 10.0
    score_source: ScoreSource = "student_progress"


@dataclass(frozen=True)
class RepeatedMistake:
    error_type: str
    count: int
    latest_detail: str | None = None


@dataclass(frozen=True)
class RecentWorksheet:
    worksheet_id: int
    worksheet_title: str
    date: str
    score: float
    max_score: float = 10.0
    score_source: ScoreSource = "student_progress"


@dataclass(frozen=True)
class PortfolioRecommendation:
    title: str
    description: str
    is_draft: bool = True


@dataclass(frozen=True)
class RecentError:
    error_type: str
    error_detail: str | None
    question_text: str | None
    created_at: str


@dataclass(frozen=True)
class StudentPortfolioCard:
    student_id: int
    student_name: str
    tier: str | None
    average_score: float
    class_average_score: float
    progress_status: ProgressStatus
    progress_status_label: str
    total_worksheets: int
    total_error_records: int
    latest_activity: str | None
    top_repeated_mistake: RepeatedMistake | None
    data_quality: list[str] = field(default_factory=list)
    score_source: ScoreSource = "none"


@dataclass(frozen=True)
class ClassStudentPortfolios:
    class_id: int
    class_name: str
    grade: int
    students: list[StudentPortfolioCard]


@dataclass(frozen=True)
class StudentPortfolioDetail:
    student_id: int
    student_name: str
    tier: str | None
    average_score: float
    class_average_score: float
    progress_status: ProgressStatus
    progress_status_label: str
    total_worksheets: int
    total_error_records: int
    score_trend: list[ScoreTrendPoint]
    repeated_mistakes: list[RepeatedMistake]
    recent_worksheets: list[RecentWorksheet]
    recent_errors: list[RecentError]
    recommendations: list[PortfolioRecommendation]
    data_quality: list[str] = field(default_factory=list)
    score_source: ScoreSource = "none"


SourcePayload = dict[str, Any]
