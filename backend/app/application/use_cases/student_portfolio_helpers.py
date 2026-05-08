from __future__ import annotations

import json
from collections import Counter
from typing import Any

from fastapi import HTTPException

from app.application.dto.student_portfolio import (
    PortfolioRecommendation,
    RecentError,
    RecentWorksheet,
    RepeatedMistake,
    ScoreSource,
    ScoreTrendPoint,
    StudentPortfolioCard,
    StudentPortfolioDetail,
)
from app.domain.services.student_progress_classifier import classify_progress_status


def ensure_owned_grade_1_to_3(math_class: Any, teacher_id: int) -> None:
    if math_class is None or math_class.teacher_id != teacher_id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem lớp này")
    if math_class.grade not in (1, 2, 3):
        raise HTTPException(status_code=400, detail="Hồ sơ tiến bộ chỉ hỗ trợ lớp 1 đến lớp 3")


def to_iso(value: Any) -> str:
    if value is None:
        return ""
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def extract_progress_score(progress: Any) -> tuple[float, float]:
    details = progress.details
    if isinstance(details, str):
        try:
            details = json.loads(details)
        except json.JSONDecodeError:
            details = None
    items = details.get("results") if isinstance(details, dict) else None
    if isinstance(items, list) and items:
        score = 0.0
        max_score = 0.0
        for item in items:
            if not isinstance(item, dict):
                continue
            score += to_float(item.get("score"), 0.0)
            max_score += to_float(item.get("max_score"), 10.0)
        if max_score > 0:
            return round(score / max_score * 10, 1), 10.0

    total_count = to_int(progress.total_count, 0)
    correct_count = to_int(progress.correct_count, 0)
    if total_count > 0:
        return round(correct_count / total_count * 10, 1), 10.0
    return 0.0, 10.0


def to_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def to_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def score_source(has_grade: bool, has_progress_fallback: bool) -> ScoreSource:
    if has_grade and has_progress_fallback:
        return "mixed"
    if has_grade:
        return "grade_entry"
    if has_progress_fallback:
        return "student_progress"
    return "none"


def build_student_scores(student_id: int, progress_rows: list[Any], grade_entries: list[Any]) -> tuple[list[ScoreTrendPoint], ScoreSource]:
    grades_by_worksheet = {entry.worksheet_id: entry for entry in grade_entries if entry.student_id == student_id}
    progress_by_worksheet = {progress.worksheet_id: progress for progress in progress_rows if progress.student_id == student_id}
    worksheet_ids = set(grades_by_worksheet) | set(progress_by_worksheet)

    points: list[ScoreTrendPoint] = []
    has_grade = False
    has_progress_fallback = False

    for worksheet_id in worksheet_ids:
        grade = grades_by_worksheet.get(worksheet_id)
        progress = progress_by_worksheet.get(worksheet_id)
        worksheet = getattr(grade, "worksheet", None) or getattr(progress, "worksheet", None)
        if grade is not None:
            score = round(float(grade.score), 1)
            point_source: ScoreSource = "grade_entry"
            date = to_iso(grade.updated_at)
            has_grade = True
        elif progress is not None:
            score, _max_score = extract_progress_score(progress)
            point_source = "student_progress"
            date = to_iso(progress.completed_at or progress.created_at)
            has_progress_fallback = True
        else:
            continue

        points.append(
            ScoreTrendPoint(
                worksheet_id=int(worksheet_id),
                worksheet_title=getattr(worksheet, "title", "Bài tập"),
                date=date,
                score=score,
                max_score=10.0,
                score_source=point_source,
            )
        )

    points.sort(key=lambda item: item.date)
    return points, score_source(has_grade, has_progress_fallback)


def build_repeated_mistakes(analytics_rows: list[Any], student_id: int) -> list[RepeatedMistake]:
    counts: Counter[str] = Counter()
    latest_detail: dict[str, str | None] = {}
    for row in analytics_rows:
        if row.student_id != student_id:
            continue
        counts[row.error_type] += int(row.count or 1)
        payload = row.payload if isinstance(row.payload, dict) else {}
        detail = payload.get("error_detail")
        if row.error_type not in latest_detail and detail:
            latest_detail[row.error_type] = str(detail)

    return [
        RepeatedMistake(error_type=error_type, count=count, latest_detail=latest_detail.get(error_type))
        for error_type, count in counts.most_common()
    ]


def build_recent_errors(analytics_rows: list[Any], student_id: int) -> list[RecentError]:
    errors: list[RecentError] = []
    for row in analytics_rows:
        if row.student_id != student_id:
            continue
        payload = row.payload if isinstance(row.payload, dict) else {}
        errors.append(
            RecentError(
                error_type=row.error_type,
                error_detail=payload.get("error_detail"),
                question_text=payload.get("question_text"),
                created_at=to_iso(row.created_at),
            )
        )
    return errors[:5]


def build_recommendations(repeated_mistakes: list[RepeatedMistake], status: str, data_quality: list[str]) -> list[PortfolioRecommendation]:
    if "no_learning_data" in data_quality:
        return [
            PortfolioRecommendation(
                title="Cần thêm dữ liệu học tập",
                description="Hãy chấm hoặc lưu một bài gần đây để hệ thống có đủ dữ liệu theo dõi tiến bộ.",
            )
        ]
    if repeated_mistakes:
        top = repeated_mistakes[0]
        return [
            PortfolioRecommendation(
                title="Gợi ý luyện tập theo lỗi lặp lại",
                description=f"Học sinh thường gặp lỗi {top.error_type}; giáo viên nên giao bài luyện ngắn và xem lại cách làm.",
            )
        ]
    if status in {"at_risk", "needs_monitoring"}:
        return [
            PortfolioRecommendation(
                title="Cần theo dõi sát hơn",
                description="Giáo viên nên kiểm tra bài gần nhất và hỗ trợ cá nhân trong buổi học tiếp theo.",
            )
        ]
    return [
        PortfolioRecommendation(
            title="Tiếp tục duy trì",
            description="Học sinh đang có tín hiệu ổn định; tiếp tục theo dõi qua các bài tiếp theo.",
        )
    ]


def build_card(student: Any, points: list[ScoreTrendPoint], repeated_mistakes: list[RepeatedMistake], class_average: float, source: ScoreSource) -> StudentPortfolioCard:
    average_score = round(sum(point.score for point in points) / len(points), 1) if points else 0.0
    data_quality = [] if points else ["no_learning_data"]
    total_errors = sum(item.count for item in repeated_mistakes)
    classification = classify_progress_status(
        score_percentages=[point.score * 10 for point in points],
        error_count=total_errors,
        class_average_score=class_average,
    )
    return StudentPortfolioCard(
        student_id=student.id,
        student_name=student.full_name,
        tier=student.tier,
        average_score=average_score,
        class_average_score=class_average,
        progress_status=classification.status,
        progress_status_label=classification.label,
        total_worksheets=len(points),
        total_error_records=total_errors,
        latest_activity=points[-1].date if points else None,
        top_repeated_mistake=repeated_mistakes[0] if repeated_mistakes else None,
        data_quality=data_quality,
        score_source=source,
    )


def build_detail(student: Any, points: list[ScoreTrendPoint], repeated_mistakes: list[RepeatedMistake], recent_errors: list[RecentError], class_average: float, source: ScoreSource) -> StudentPortfolioDetail:
    card = build_card(student, points, repeated_mistakes, class_average, source)
    recent_worksheets = [
        RecentWorksheet(
            worksheet_id=point.worksheet_id,
            worksheet_title=point.worksheet_title,
            date=point.date,
            score=point.score,
            max_score=point.max_score,
            score_source=point.score_source,
        )
        for point in reversed(points[-5:])
    ]
    return StudentPortfolioDetail(
        student_id=card.student_id,
        student_name=card.student_name,
        tier=card.tier,
        average_score=card.average_score,
        class_average_score=card.class_average_score,
        progress_status=card.progress_status,
        progress_status_label=card.progress_status_label,
        total_worksheets=card.total_worksheets,
        total_error_records=card.total_error_records,
        score_trend=points,
        repeated_mistakes=repeated_mistakes,
        recent_worksheets=recent_worksheets,
        recent_errors=recent_errors,
        recommendations=build_recommendations(repeated_mistakes, card.progress_status, card.data_quality),
        data_quality=card.data_quality,
        score_source=card.score_source,
    )
