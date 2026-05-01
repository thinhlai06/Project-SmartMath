from __future__ import annotations

from fastapi import HTTPException

from app.domain.repositories.topic_repository import TopicRepository
from app.schemas.cpa_bundle import CPABundleGenerationResponse, CPABundleRendered
from app.services.ai.cpa_bundle_generator import CPABundleGenerator
from app.services.ai.cpa_validator import CPABundleValidator
from app.services.ai.ollama_service import OllamaService
from app.services.ai.topic_family import build_topic_generation_metadata
from app.services.cpa_render_service import CPARenderService


class GenerateCPABundleUseCase:
    """Generate structured CPA bundles and run pedagogical validation."""

    def __init__(
        self,
        topic_repository: TopicRepository,
        bundle_generator: CPABundleGenerator,
        validator: CPABundleValidator,
        render_service: CPARenderService,
    ):
        self.topic_repository = topic_repository
        self.bundle_generator = bundle_generator
        self.validator = validator
        self.render_service = render_service

    def execute(
        self,
        topic_id: int,
        grade: int,
        objective: str,
        bundle_count: int = 3,
    ) -> CPABundleGenerationResponse:
        if grade not in (1, 2, 3):
            raise HTTPException(status_code=400, detail="Chi ho tro lop 1, 2, hoac 3")

        if not OllamaService.is_running():
            raise HTTPException(
                status_code=503,
                detail="Ollama khong kha dung. Vui long kiem tra Ollama daemon dang chay.",
            )

        topic = self.topic_repository.get_by_id(topic_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        topic_metadata = build_topic_generation_metadata(
            topic_name=str(topic.topic_name),
            category=str(topic.category),
        )

        try:
            bundles, rag_sources = self.bundle_generator.generate_bundles(
                topic_metadata=topic_metadata,
                grade=grade,
                objective=objective,
                count=bundle_count,
            )
        except ValueError as exc:
            message = str(exc)
            normalized = message.lower()
            if (
                "unsupported" in normalized
                or "chua ho tro" in normalized
                or "no generator" in normalized
                or ("requires" in normalized and "operation" in normalized)
            ):
                error_code = "unsupported_bundle_family"
            else:
                error_code = "bundle_generation_error"
            raise HTTPException(
                status_code=422,
                detail={
                    "error_code": error_code,
                    "message": message,
                },
            ) from exc

        for bundle in bundles:
            validation = self.validator.validate(bundle)
            bundle.validation_status = validation.status
            bundle.validator_messages = validation.issues
            bundle.rendered = CPABundleRendered(
                concrete_html=self.render_service.render_concrete_html(bundle.concrete),
                pictorial_svg=self.render_service.render_pictorial_svg(bundle.pictorial),
                abstract_latex=self.render_service.render_abstract_latex(bundle.abstract),
            )

        return CPABundleGenerationResponse(
            bundles=bundles,
            rag_sources=rag_sources,
        )