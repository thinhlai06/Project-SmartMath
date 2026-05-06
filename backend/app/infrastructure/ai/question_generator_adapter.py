from __future__ import annotations

from typing import Dict, List

from app.application.ports.question_generation_port import QuestionGenerationPort
from app.services.ai.question_generator import QuestionGenerator


class QuestionGeneratorAdapter(QuestionGenerationPort):
    """Adapter from application port to existing AI question generator service."""

    def __init__(self):
        self.generator = QuestionGenerator()

    def generate_differentiation_questions(
        self,
        topic: str,
        grade: int,
        objective: str,
        tiers: List[str] | None = None,
    ) -> Dict:
        normalized_tiers = tiers if tiers is not None else ["foundation", "standard", "extension", "advanced"]
        return self.generator.generate_differentiation_questions_new(
            topic=topic,
            grade=grade,
            objective=objective,
            tiers=normalized_tiers,
        )
