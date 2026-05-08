from __future__ import annotations

from fastapi import HTTPException

from app.application.dto.student_portfolio import StudentPortfolioDetail
from app.application.use_cases.student_portfolio_helpers import (
    build_detail,
    build_recent_errors,
    build_repeated_mistakes,
    build_student_scores,
    ensure_owned_grade_1_to_3,
)
from app.domain.repositories.student_portfolio_repository import StudentPortfolioRepository


class GetStudentPortfolioDetailUseCase:
    def __init__(self, repository: StudentPortfolioRepository):
        self.repository = repository

    def execute(self, class_id: int, student_id: int, teacher_id: int) -> StudentPortfolioDetail:
        math_class = self.repository.get_class(class_id)
        ensure_owned_grade_1_to_3(math_class, teacher_id)

        students = self.repository.list_students(class_id)
        student = next((item for item in students if item.id == student_id), None)
        if student is None:
            raise HTTPException(status_code=404, detail="Học sinh không thuộc lớp này")

        class_progress_rows = self.repository.list_progress(class_id)
        class_grade_entries = self.repository.list_grade_entries(class_id)
        class_scores = []
        for item in students:
            item_points, _source = build_student_scores(item.id, class_progress_rows, class_grade_entries)
            if item_points:
                class_scores.append(sum(point.score for point in item_points) / len(item_points))
        class_average = round(sum(class_scores) / len(class_scores), 1) if class_scores else 0.0

        progress_rows = self.repository.list_progress(class_id, student_id)
        grade_entries = self.repository.list_grade_entries(class_id, student_id)
        analytics_rows = self.repository.list_analytics(class_id, teacher_id, student_id)

        points, source = build_student_scores(student_id, progress_rows, grade_entries)
        repeated_mistakes = build_repeated_mistakes(analytics_rows, student_id)
        recent_errors = build_recent_errors(analytics_rows, student_id)

        return build_detail(student, points, repeated_mistakes, recent_errors, class_average, source)
