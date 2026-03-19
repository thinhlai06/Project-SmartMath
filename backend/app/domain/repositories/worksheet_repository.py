from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.models.worksheet import Worksheet


class WorksheetRepository(ABC):
    """Port for worksheet persistence access."""

    @abstractmethod
    def get_by_id(self, worksheet_id: int) -> Optional[Worksheet]:
        raise NotImplementedError

    @abstractmethod
    def publish(self, worksheet: Worksheet) -> Worksheet:
        raise NotImplementedError
