from __future__ import annotations

from typing import Dict, List

from app.application.ports.question_generation_port import QuestionGenerationPort
from app.services.ai.question_generator import QuestionGenerator


class QuestionGeneratorAdapter(QuestionGenerationPort):
    """Adapter from application port to existing AI question generator service."""

    def __init__(self):
        self.generator = QuestionGenerator()

    def generate_cpa_questions(
        self,
        topic: str,
        grade: int,
        objective: str,
        counts: Dict[str, int] | None = None,
    ) -> Dict:
        normalized_counts = counts if counts is not None else {"concrete": 3, "pictorial": 3, "abstract": 3}
        return self.generator.generate_cpa_questions(
            topic=topic,
            grade=grade,
            objective=objective,
            counts=normalized_counts,
        )

    def generate_differentiation_questions(
        self,
        topic: str,
        grade: int,
        objective: str,
        tiers: List[str] | None = None,
    ) -> Dict:
        normalized_tiers = tiers if tiers is not None else ["foundation", "standard", "extension", "advanced"]
        return self.generator.generate_differentiation_questions(
            topic=topic,
            grade=grade,
            objective=objective,
            tiers=normalized_tiers,
        )
