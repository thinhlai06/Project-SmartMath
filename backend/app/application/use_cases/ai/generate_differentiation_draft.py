from __future__ import annotations

from fastapi import HTTPException

from app.application.ports.question_generation_port import QuestionGenerationPort
from app.domain.repositories.topic_repository import TopicRepository
from app.services.ai.ollama_service import OllamaService


class GenerateDifferentiationDraftUseCase:
    """Generate differentiation draft questions for teacher workflow."""

    def __init__(
        self,
        topic_repository: TopicRepository,
        question_generation_port: QuestionGenerationPort,
    ):
        self.topic_repository = topic_repository
        self.question_generation_port = question_generation_port

    def execute(
        self,
        topic_id: int,
        grade: int,
        objective: str,
        tiers: list[str] | None,
    ) -> dict:
        if grade not in (1, 2, 3):
            raise HTTPException(status_code=400, detail="Chi ho tro lop 1, 2, hoac 3")

        if not OllamaService.is_running():
            raise HTTPException(status_code=503, detail="Ollama khong kha dung")

        topic = self.topic_repository.get_by_id(topic_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        try:
            return self.question_generation_port.generate_differentiation_questions(
                topic=str(topic.topic_name),
                grade=grade,
                objective=objective,
                tiers=tiers,
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail="Sinh noi dung AI that bai. Vui long thu lai sau.",
            ) from exc
