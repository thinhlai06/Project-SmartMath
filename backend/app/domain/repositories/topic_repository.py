from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.models.math_topic import MathTopic


class TopicRepository(ABC):
    """Port for topic persistence access in the domain/application boundary."""

    @abstractmethod
    def get_by_id(self, topic_id: int) -> Optional[MathTopic]:
        raise NotImplementedError
