from __future__ import annotations

from unittest.mock import Mock, patch

import pytest
from fastapi import HTTPException

from app.application.use_cases.ai.generate_differentiation_draft import (
    GenerateDifferentiationDraftUseCase,
)


def test_generate_differentiation_usecase_requires_ollama_runtime() -> None:
    use_case = GenerateDifferentiationDraftUseCase(topic_repository=Mock(), question_generation_port=Mock())

    with patch(
        "app.application.use_cases.ai.generate_differentiation_draft.OllamaService.is_running",
        return_value=False,
    ):
        with pytest.raises(HTTPException) as exc:
            use_case.execute(topic_id=1, grade=1, objective="test", tiers=None)

    assert exc.value.status_code == 503
    assert "Ollama" in str(exc.value.detail)
