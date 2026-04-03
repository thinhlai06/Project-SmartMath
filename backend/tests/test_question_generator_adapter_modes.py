from __future__ import annotations

from unittest.mock import Mock

from app.infrastructure.ai.question_generator_adapter import QuestionGeneratorAdapter


def test_adapter_always_uses_new_pipeline_for_cpa() -> None:
    adapter = QuestionGeneratorAdapter()
    adapter.generator = Mock()
    adapter.generator.generate_cpa_questions_new.return_value = {"ok": "new"}

    result = adapter.generate_cpa_questions(topic="Hình học cơ bản", grade=1, objective="test", counts=None)

    assert result == {"ok": "new"}
    adapter.generator.generate_cpa_questions_new.assert_called_once()
    adapter.generator.generate_cpa_questions_legacy.assert_not_called()


def test_adapter_always_uses_new_pipeline_for_differentiation() -> None:
    adapter = QuestionGeneratorAdapter()
    adapter.generator = Mock()
    adapter.generator.generate_differentiation_questions_new.return_value = {"ok": "new"}

    result = adapter.generate_differentiation_questions(
        topic="Phép chia có dư",
        grade=3,
        objective="test",
        tiers=None,
    )

    assert result == {"ok": "new"}
    adapter.generator.generate_differentiation_questions_new.assert_called_once()
    adapter.generator.generate_differentiation_questions_legacy.assert_not_called()
