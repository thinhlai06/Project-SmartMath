from __future__ import annotations

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.ai.generate_cpa_draft import GenerateCPADraftUseCase
from app.application.use_cases.ai.generate_differentiation_draft import (
    GenerateDifferentiationDraftUseCase,
)
from app.database import get_db
from app.infrastructure.ai.question_generator_adapter import QuestionGeneratorAdapter
from app.infrastructure.db.sqlalchemy.repositories.topic_repository import (
    SqlAlchemyTopicRepository,
)


def get_topic_repository(db: Session = Depends(get_db)) -> SqlAlchemyTopicRepository:
    return SqlAlchemyTopicRepository(db)


def get_question_generation_port() -> QuestionGeneratorAdapter:
    return QuestionGeneratorAdapter()


def get_generate_cpa_draft_use_case(
    topic_repository: SqlAlchemyTopicRepository = Depends(get_topic_repository),
    question_generation_port: QuestionGeneratorAdapter = Depends(get_question_generation_port),
) -> GenerateCPADraftUseCase:
    return GenerateCPADraftUseCase(topic_repository, question_generation_port)


def get_generate_differentiation_draft_use_case(
    topic_repository: SqlAlchemyTopicRepository = Depends(get_topic_repository),
    question_generation_port: QuestionGeneratorAdapter = Depends(get_question_generation_port),
) -> GenerateDifferentiationDraftUseCase:
    return GenerateDifferentiationDraftUseCase(topic_repository, question_generation_port)
