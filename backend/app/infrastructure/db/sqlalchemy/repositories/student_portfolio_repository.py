from __future__ import annotations

from sqlalchemy.orm import Session, joinedload

from app.domain.repositories.student_portfolio_repository import StudentPortfolioRepository
from app.models.grade_entry import GradeEntry
from app.models.math_class import MathClass
from app.models.student import Student
from app.models.student_analytics import StudentAnalytics
from app.models.student_progress import StudentProgress
from app.models.worksheet import Worksheet


class SqlAlchemyStudentPortfolioRepository(StudentPortfolioRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_class(self, class_id: int) -> MathClass | None:
        return self.db.query(MathClass).filter(MathClass.id == class_id).first()

    def list_students(self, class_id: int) -> list[Student]:
        return (
            self.db.query(Student)
            .filter(Student.class_id == class_id)
            .order_by(Student.full_name.asc())
            .all()
        )

    def student_belongs_to_class(self, class_id: int, student_id: int) -> bool:
        return (
            self.db.query(Student.id)
            .filter(Student.id == student_id, Student.class_id == class_id)
            .first()
            is not None
        )

    def list_progress(self, class_id: int, student_id: int | None = None) -> list[StudentProgress]:
        query = (
            self.db.query(StudentProgress)
            .join(Student, Student.id == StudentProgress.student_id)
            .join(Worksheet, Worksheet.id == StudentProgress.worksheet_id)
            .options(joinedload(StudentProgress.worksheet))
            .filter(Student.class_id == class_id, Worksheet.class_id == class_id)
        )
        if student_id is not None:
            query = query.filter(StudentProgress.student_id == student_id)
        return query.order_by(StudentProgress.created_at.asc()).all()

    def list_grade_entries(self, class_id: int, student_id: int | None = None) -> list[GradeEntry]:
        query = (
            self.db.query(GradeEntry)
            .join(Student, Student.id == GradeEntry.student_id)
            .join(Worksheet, Worksheet.id == GradeEntry.worksheet_id)
            .options(joinedload(GradeEntry.worksheet))
            .filter(Student.class_id == class_id, Worksheet.class_id == class_id)
        )
        if student_id is not None:
            query = query.filter(GradeEntry.student_id == student_id)
        return query.order_by(GradeEntry.updated_at.asc()).all()

    def list_analytics(self, class_id: int, teacher_id: int, student_id: int | None = None) -> list[StudentAnalytics]:
        query = self.db.query(StudentAnalytics).filter(
            StudentAnalytics.class_id == class_id,
            StudentAnalytics.teacher_id == teacher_id,
        )
        if student_id is not None:
            query = query.filter(StudentAnalytics.student_id == student_id)
        return query.order_by(StudentAnalytics.created_at.desc()).all()
