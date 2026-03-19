from __future__ import annotations

from fastapi import HTTPException

from app.application.ports.question_generation_port import QuestionGenerationPort
from app.domain.repositories.topic_repository import TopicRepository
from app.services.ai.lmstudio_service import LMStudioService


class GenerateCPADraftUseCase:
    """Generate CPA draft questions for teacher workflow."""

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
        counts: dict | None,
    ) -> dict:
        if not LMStudioService.is_running():
            raise HTTPException(
                status_code=503,
                detail="LMStudio khong kha dung. Vui long kiem tra LMStudio dang chay o cong 1234.",
            )

        topic = self.topic_repository.get_by_id(topic_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        try:
            return self.question_generation_port.generate_cpa_questions(
                topic=str(topic.topic_name),
                grade=grade,
                objective=objective,
                counts=counts,
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Generation failed: {str(exc)}") from exc
