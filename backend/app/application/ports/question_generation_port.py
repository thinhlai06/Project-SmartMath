from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, List


class QuestionGenerationPort(ABC):
    """Port for AI question generation engine (LLM + RAG)."""

    @abstractmethod
    def generate_differentiation_questions(
        self,
        topic: str,
        grade: int,
        objective: str,
        tiers: List[str] | None = None,
    ) -> Dict:
        raise NotImplementedError
