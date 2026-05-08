from __future__ import annotations

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.ai.generate_differentiation_draft import (
    GenerateDifferentiationDraftUseCase,
)
from app.application.use_cases.get_class_student_portfolios import GetClassStudentPortfoliosUseCase
from app.application.use_cases.get_student_portfolio_detail import GetStudentPortfolioDetailUseCase
from app.application.use_cases.worksheet.publish_worksheet import PublishWorksheetUseCase
from app.database import get_db
from app.infrastructure.ai.question_generator_adapter import QuestionGeneratorAdapter
from app.infrastructure.db.sqlalchemy.repositories.class_repository import (
    SqlAlchemyClassRepository,
)
from app.infrastructure.db.sqlalchemy.repositories.student_portfolio_repository import (
    SqlAlchemyStudentPortfolioRepository,
)
from app.infrastructure.db.sqlalchemy.repositories.topic_repository import (
    SqlAlchemyTopicRepository,
)
from app.infrastructure.db.sqlalchemy.repositories.worksheet_repository import (
    SqlAlchemyWorksheetRepository,
)
from app.services.ai.rag_service import RAGService


def get_topic_repository(db: Session = Depends(get_db)) -> SqlAlchemyTopicRepository:
    return SqlAlchemyTopicRepository(db)


def get_worksheet_repository(db: Session = Depends(get_db)) -> SqlAlchemyWorksheetRepository:
    return SqlAlchemyWorksheetRepository(db)


def get_class_repository(db: Session = Depends(get_db)) -> SqlAlchemyClassRepository:
    return SqlAlchemyClassRepository(db)


def get_student_portfolio_repository(
    db: Session = Depends(get_db),
) -> SqlAlchemyStudentPortfolioRepository:
    return SqlAlchemyStudentPortfolioRepository(db)


def get_question_generation_port() -> QuestionGeneratorAdapter:
    return QuestionGeneratorAdapter()


def get_rag_service() -> RAGService:
    return RAGService()


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


def get_class_student_portfolios_use_case(
    repository: SqlAlchemyStudentPortfolioRepository = Depends(get_student_portfolio_repository),
) -> GetClassStudentPortfoliosUseCase:
    return GetClassStudentPortfoliosUseCase(repository)


def get_student_portfolio_detail_use_case(
    repository: SqlAlchemyStudentPortfolioRepository = Depends(get_student_portfolio_repository),
) -> GetStudentPortfolioDetailUseCase:
    return GetStudentPortfolioDetailUseCase(repository)
