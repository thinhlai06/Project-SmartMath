from __future__ import annotations

from sqlalchemy.orm import Session

from app.domain.repositories.class_repository import ClassRepository
from app.models.math_class import MathClass


class SqlAlchemyClassRepository(ClassRepository):
    """SQLAlchemy implementation for class ownership checks."""

    def __init__(self, db: Session):
        self.db = db

    def teacher_owns_class(self, class_id: int, teacher_id: int) -> bool:
        math_class = (
            self.db.query(MathClass)
            .filter(MathClass.id == class_id, MathClass.teacher_id == teacher_id)
            .first()
        )
        return math_class is not None
