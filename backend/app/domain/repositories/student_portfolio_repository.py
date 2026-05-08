from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class StudentPortfolioRepository(ABC):
    @abstractmethod
    def get_class(self, class_id: int) -> Any | None:
        raise NotImplementedError

    @abstractmethod
    def list_students(self, class_id: int) -> list[Any]:
        raise NotImplementedError

    @abstractmethod
    def student_belongs_to_class(self, class_id: int, student_id: int) -> bool:
        raise NotImplementedError

    @abstractmethod
    def list_progress(self, class_id: int, student_id: int | None = None) -> list[Any]:
        raise NotImplementedError

    @abstractmethod
    def list_grade_entries(self, class_id: int, student_id: int | None = None) -> list[Any]:
        raise NotImplementedError

    @abstractmethod
    def list_analytics(self, class_id: int, teacher_id: int, student_id: int | None = None) -> list[Any]:
        raise NotImplementedError
