from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

ProgressStatus = Literal["no_data", "improving", "stable", "needs_monitoring", "at_risk"]


@dataclass(frozen=True)
class ProgressClassification:
    status: ProgressStatus
    label: str


def classify_progress_status(
    score_percentages: list[float],
    error_count: int,
    class_average_score: float,
) -> ProgressClassification:
    if not score_percentages:
        return ProgressClassification(status="no_data", label="Chưa đủ dữ liệu")

    latest = score_percentages[-1]
    first = score_percentages[0]
    class_average_percentage = class_average_score * 10

    if latest < 50 or error_count >= 8:
        return ProgressClassification(status="at_risk", label="Cần can thiệp")

    if len(score_percentages) >= 2 and latest - first >= 10:
        return ProgressClassification(status="improving", label="Đang tiến bộ")

    if latest < class_average_percentage - 10 or error_count >= 4:
        return ProgressClassification(status="needs_monitoring", label="Cần theo dõi")

    return ProgressClassification(status="stable", label="Ổn định")
