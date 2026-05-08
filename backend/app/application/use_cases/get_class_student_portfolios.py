from __future__ import annotations

from app.application.dto.student_portfolio import ClassStudentPortfolios
from app.application.use_cases.student_portfolio_helpers import (
    build_card,
    build_repeated_mistakes,
    build_student_scores,
    ensure_owned_grade_1_to_3,
)
from app.domain.repositories.student_portfolio_repository import StudentPortfolioRepository


class GetClassStudentPortfoliosUseCase:
    def __init__(self, repository: StudentPortfolioRepository):
        self.repository = repository

    def execute(self, class_id: int, teacher_id: int) -> ClassStudentPortfolios:
        math_class = self.repository.get_class(class_id)
        ensure_owned_grade_1_to_3(math_class, teacher_id)

        students = self.repository.list_students(class_id)
        progress_rows = self.repository.list_progress(class_id)
        grade_entries = self.repository.list_grade_entries(class_id)
        analytics_rows = self.repository.list_analytics(class_id, teacher_id)

        points_by_student = {}
        mistakes_by_student = {}
        sources_by_student = {}
        scored_averages = []

        for student in students:
            points, source = build_student_scores(student.id, progress_rows, grade_entries)
            mistakes = build_repeated_mistakes(analytics_rows, student.id)
            points_by_student[student.id] = points
            mistakes_by_student[student.id] = mistakes
            sources_by_student[student.id] = source
            if points:
                scored_averages.append(sum(point.score for point in points) / len(points))

        class_average = round(sum(scored_averages) / len(scored_averages), 1) if scored_averages else 0.0
        cards = [
            build_card(
                student,
                points_by_student[student.id],
                mistakes_by_student[student.id],
                class_average,
                sources_by_student[student.id],
            )
            for student in students
        ]

        return ClassStudentPortfolios(
            class_id=math_class.id,
            class_name=math_class.class_name,
            grade=math_class.grade,
            students=cards,
        )
