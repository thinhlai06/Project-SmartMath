from __future__ import annotations

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.ai.generate_cpa_bundle import GenerateCPABundleUseCase
from app.application.use_cases.ai.generate_cpa_draft import GenerateCPADraftUseCase
from app.application.use_cases.ai.generate_differentiation_draft import (
    GenerateDifferentiationDraftUseCase,
)
from app.application.use_cases.ai.save_cpa_bundles import SaveCPABundlesUseCase
from app.application.use_cases.worksheet.publish_worksheet import PublishWorksheetUseCase
from app.database import get_db
from app.infrastructure.db.sqlalchemy.repositories.cpa_bundle_repository import (
    SqlAlchemyCPABundleRepository,
)
from app.infrastructure.ai.question_generator_adapter import QuestionGeneratorAdapter
from app.infrastructure.db.sqlalchemy.repositories.class_repository import (
    SqlAlchemyClassRepository,
)
from app.infrastructure.db.sqlalchemy.repositories.topic_repository import (
    SqlAlchemyTopicRepository,
)
from app.infrastructure.db.sqlalchemy.repositories.worksheet_repository import (
    SqlAlchemyWorksheetRepository,
)
from app.services.ai.cpa_bundle_generator import CPABundleGenerator
from app.services.ai.cpa_validator import CPABundleValidator
from app.services.cpa_render_service import CPARenderService


def get_topic_repository(db: Session = Depends(get_db)) -> SqlAlchemyTopicRepository:
    return SqlAlchemyTopicRepository(db)


def get_worksheet_repository(db: Session = Depends(get_db)) -> SqlAlchemyWorksheetRepository:
    return SqlAlchemyWorksheetRepository(db)


def get_class_repository(db: Session = Depends(get_db)) -> SqlAlchemyClassRepository:
    return SqlAlchemyClassRepository(db)


def get_question_generation_port() -> QuestionGeneratorAdapter:
    return QuestionGeneratorAdapter()


def get_cpa_bundle_repository(db: Session = Depends(get_db)) -> SqlAlchemyCPABundleRepository:
    return SqlAlchemyCPABundleRepository(db)


def get_cpa_validator() -> CPABundleValidator:
    return CPABundleValidator()


def get_cpa_render_service() -> CPARenderService:
    return CPARenderService()


def get_cpa_bundle_generator(
    validator: CPABundleValidator = Depends(get_cpa_validator),
) -> CPABundleGenerator:
    return CPABundleGenerator(validator=validator)


def get_generate_cpa_draft_use_case(
    topic_repository: SqlAlchemyTopicRepository = Depends(get_topic_repository),
    question_generation_port: QuestionGeneratorAdapter = Depends(get_question_generation_port),
) -> GenerateCPADraftUseCase:
    return GenerateCPADraftUseCase(topic_repository, question_generation_port)


def get_generate_cpa_bundle_use_case(
    topic_repository: SqlAlchemyTopicRepository = Depends(get_topic_repository),
    bundle_generator: CPABundleGenerator = Depends(get_cpa_bundle_generator),
    validator: CPABundleValidator = Depends(get_cpa_validator),
    render_service: CPARenderService = Depends(get_cpa_render_service),
) -> GenerateCPABundleUseCase:
    return GenerateCPABundleUseCase(
        topic_repository=topic_repository,
        bundle_generator=bundle_generator,
        validator=validator,
        render_service=render_service,
    )


def get_save_cpa_bundles_use_case(
    repository: SqlAlchemyCPABundleRepository = Depends(get_cpa_bundle_repository),
    validator: CPABundleValidator = Depends(get_cpa_validator),
) -> SaveCPABundlesUseCase:
    return SaveCPABundlesUseCase(repository=repository, validator=validator)


def get_generate_differentiation_draft_use_case(
    topic_repository: SqlAlchemyTopicRepository = Depends(get_topic_repository),
    question_generation_port: QuestionGeneratorAdapter = Depends(get_question_generation_port),
) -> GenerateDifferentiationDraftUseCase:
    return GenerateDifferentiationDraftUseCase(topic_repository, question_generation_port)


def get_publish_worksheet_use_case(
    worksheet_repository: SqlAlchemyWorksheetRepository = Depends(get_worksheet_repository),
    class_repository: SqlAlchemyClassRepository = Depends(get_class_repository),
) -> PublishWorksheetUseCase:
    return PublishWorksheetUseCase(
        worksheet_repository=worksheet_repository,
        class_repository=class_repository,
    )
