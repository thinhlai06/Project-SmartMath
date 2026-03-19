from __future__ import annotations

from abc import ABC, abstractmethod


class ClassRepository(ABC):
    """Port for class ownership checks used by worksheet use cases."""

    @abstractmethod
    def teacher_owns_class(self, class_id: int, teacher_id: int) -> bool:
        raise NotImplementedError
