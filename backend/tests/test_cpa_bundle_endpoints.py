from unittest.mock import patch
from typing import cast

from fastapi import HTTPException

from app.application.use_cases.ai.generate_cpa_bundle import GenerateCPABundleUseCase
from app.application.use_cases.ai.save_cpa_bundles import SaveCPABundlesUseCase
from app.infrastructure.db.sqlalchemy.repositories.cpa_bundle_repository import (
    SqlAlchemyCPABundleRepository,
)
from app.infrastructure.db.sqlalchemy.repositories.topic_repository import SqlAlchemyTopicRepository
from app.models.math_class import MathClass
from app.models.math_topic import MathTopic
from app.models.user import User, UserRole
from app.models.worksheet import Worksheet, WorksheetType
from app.schemas.cpa_bundle import CPABundle
from app.services.ai.cpa_bundle_generator import CPABundleGenerator
from app.services.ai.cpa_validator import CPABundleValidator
from app.services.cpa_render_service import CPARenderService


def _seed_topic(db_session):
    topic = MathTopic(topic_name="Phep cong trong pham vi 20", category="So hoc", grade=2)
    db_session.add(topic)
    db_session.commit()
    db_session.refresh(topic)
    return topic


def _seed_topic_with_family(db_session, topic_name: str, category: str, grade: int = 2):
    topic = MathTopic(topic_name=topic_name, category=category, grade=grade)
    db_session.add(topic)
    db_session.commit()
    db_session.refresh(topic)
    return topic


def _seed_worksheet(db_session):
    teacher = User(
        email="bundle_teacher@example.com",
        password_hash="hash",
        full_name="Bundle Teacher",
        role=UserRole.TEACHER,
    )
    db_session.add(teacher)
    db_session.commit()
    db_session.refresh(teacher)

    math_class = MathClass(class_name="2A", grade=2, teacher_id=teacher.id)
    db_session.add(math_class)
    db_session.commit()
    db_session.refresh(math_class)

    worksheet = Worksheet(
        title="CPA Bundle",
        class_id=math_class.id,
        grade=2,
        worksheet_type=WorksheetType.CPA,
        objective="Luyen phep cong",
    )
    db_session.add(worksheet)
    db_session.commit()
    db_session.refresh(worksheet)
    return worksheet


def test_generate_cpa_bundle_use_case(db_session):
    topic = _seed_topic(db_session)

    mocked_json = "{}"

    use_case = GenerateCPABundleUseCase(
        topic_repository=SqlAlchemyTopicRepository(db_session),
        bundle_generator=CPABundleGenerator(validator=CPABundleValidator()),
        validator=CPABundleValidator(),
        render_service=CPARenderService(),
    )

    with patch("app.services.ai.ollama_service.OllamaService.is_running", return_value=True), patch(
        "app.services.ai.ollama_service.OllamaService.generate",
        return_value=mocked_json,
    ):
        response = use_case.execute(
            topic_id=cast(int, topic.id),
            grade=2,
            objective="Luyen phep cong",
            bundle_count=1,
        )

    assert len(response.bundles) == 1
    bundle = response.bundles[0]
    assert bundle.math_core is not None
    assert bundle.math_core.common.grade == 2
    assert bundle.rendered is not None
    assert bundle.rendered.pictorial_svg is not None


def test_generate_cpa_bundle_supports_geometry_family(db_session):
    topic = _seed_topic_with_family(
        db_session,
        topic_name="Hinh vuong, hinh tron, hinh tam giac",
        category="Hinh hoc",
        grade=1,
    )

    use_case = GenerateCPABundleUseCase(
        topic_repository=SqlAlchemyTopicRepository(db_session),
        bundle_generator=CPABundleGenerator(validator=CPABundleValidator()),
        validator=CPABundleValidator(),
        render_service=CPARenderService(),
    )

    with patch("app.services.ai.ollama_service.OllamaService.is_running", return_value=True):
        response = use_case.execute(
            topic_id=cast(int, topic.id),
            grade=1,
            objective="Nhan biet hinh hoc",
            bundle_count=1,
        )

    assert len(response.bundles) == 1
    bundle = response.bundles[0]
    assert bundle.content_family == "geometry"
    assert bundle.math_core is None
    assert bundle.family_payload.get("target_shape") is not None
    assert bundle.rendered is not None


def test_generate_cpa_bundle_supports_measurement_family(db_session):
    topic = _seed_topic_with_family(
        db_session,
        topic_name="Do do dai (cm)",
        category="Do luong",
        grade=1,
    )

    use_case = GenerateCPABundleUseCase(
        topic_repository=SqlAlchemyTopicRepository(db_session),
        bundle_generator=CPABundleGenerator(validator=CPABundleValidator()),
        validator=CPABundleValidator(),
        render_service=CPARenderService(),
    )

    with patch("app.services.ai.ollama_service.OllamaService.is_running", return_value=True):
        response = use_case.execute(
            topic_id=cast(int, topic.id),
            grade=1,
            objective="Doc gia tri do luong",
            bundle_count=1,
        )

    assert len(response.bundles) == 1
    bundle = response.bundles[0]
    assert bundle.content_family == "measurement"
    assert bundle.family_payload.get("unit") is not None


def test_generate_cpa_bundle_rejects_unsupported_arithmetic_topic(db_session):
    topic = _seed_topic_with_family(
        db_session,
        topic_name="Cac so den 100",
        category="So hoc",
        grade=1,
    )

    use_case = GenerateCPABundleUseCase(
        topic_repository=SqlAlchemyTopicRepository(db_session),
        bundle_generator=CPABundleGenerator(validator=CPABundleValidator()),
        validator=CPABundleValidator(),
        render_service=CPARenderService(),
    )

    with patch("app.services.ai.ollama_service.OllamaService.is_running", return_value=True):
        try:
            use_case.execute(
                topic_id=cast(int, topic.id),
                grade=1,
                objective="On tap nhan dien so",
                bundle_count=1,
            )
            assert False, "Expected HTTPException for unsupported arithmetic subtype"
        except HTTPException as exc:
            assert exc.status_code == 422
            assert "operation family" in str(exc.detail).lower() or "ho tro" in str(exc.detail).lower()


def test_save_cpa_bundles_use_case(db_session):
    worksheet = _seed_worksheet(db_session)

    repository = SqlAlchemyCPABundleRepository(db_session)
    use_case = SaveCPABundlesUseCase(repository=repository, validator=CPABundleValidator())

    bundle = CPABundle.model_validate(
        {
            "math_core": {
                "common": {
                    "topic": "Phep cong trong pham vi 20",
                    "grade": 2,
                    "operation_family": "addition",
                    "difficulty_band": "standard",
                },
                "specific": {"operand_a": 7, "operand_b": 5, "result": 12},
            },
            "concrete": {
                "manipulative_type": "que_tinh",
                "groups": [
                    {"label": "Nhom 1", "count": 7, "color": "#4CAF50"},
                    {"label": "Nhom 2", "count": 5, "color": "#2196F3"},
                ],
                "action_instruction": "Lay bay que tinh va them nam que tinh roi dem ket qua.",
                "result_prompt": "Tat ca co bao nhieu que tinh?",
                "answer": "12",
            },
            "pictorial": {
                "diagram_type": "dot_array",
                "groups": [
                    {"count": 7, "color": "#4CAF50", "shape": "circle"},
                    {"count": 5, "color": "#2196F3", "shape": "circle"},
                ],
                "question_text": "Nhin hinh va tim tong so cham.",
                "answer": "12",
                "layout": "horizontal",
            },
            "abstract": {
                "expression": "7 + 5 = ?",
                "answer": "12",
                "hint": "Dem tiep tu 7",
                "show_blank": True,
            },
        }
    )

    worksheet_id = cast(int, worksheet.id)
    result = use_case.execute(worksheet_id=worksheet_id, bundles=[bundle])
    assert result["saved_count"] == 1

    persisted = repository.get_by_worksheet_id(worksheet_id)
    assert len(persisted) == 1
    assert persisted[0].abstract.expression == "7 + 5 = ?"