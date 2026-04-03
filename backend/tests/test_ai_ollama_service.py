from __future__ import annotations

from unittest.mock import patch

import pytest
import requests

from app.services.ai.ollama_service import OllamaService


class _FakeResponse:
    def __init__(self, status_code: int, payload: dict):
        self.status_code = status_code
        self._payload = payload

    def json(self) -> dict:
        return self._payload

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise requests.HTTPError(f"HTTP {self.status_code}")


def test_ollama_is_running_true() -> None:
    with patch("app.services.ai.ollama_service.requests.get", return_value=_FakeResponse(200, {})):
        assert OllamaService.is_running() is True


def test_get_loaded_models_from_ps() -> None:
    response = {
        "models": [
            {"name": "qwen3:1.7b"},
            {"model": "glm-ocr:latest"},
        ]
    }
    with patch("app.services.ai.ollama_service.requests.get", return_value=_FakeResponse(200, response)):
        assert OllamaService.get_loaded_models() == ["qwen3:1.7b", "glm-ocr:latest"]


def test_generate_strips_think_tags() -> None:
    payload = {
        "message": {
            "content": "<think>private chain of thought</think>\n[{\"question\":\"2+2=?\"}]"
        }
    }
    with patch("app.services.ai.ollama_service.requests.post", return_value=_FakeResponse(200, payload)):
        output = OllamaService.generate("test prompt", temperature=0.1)

    assert "<think>" not in output
    assert "private chain of thought" not in output
    assert output.startswith("[")


def test_generate_connection_error() -> None:
    with patch(
        "app.services.ai.ollama_service.requests.post",
        side_effect=requests.exceptions.ConnectionError(),
    ):
        with pytest.raises(ConnectionError):
            OllamaService.generate("test prompt")


def test_vision_recognize_fallback_temp_file_path() -> None:
    with patch.object(
        OllamaService,
        "_vision_chat",
        side_effect=[Exception("inline failed"), '{"raw_text":"abc"}'],
    ):
        result = OllamaService.vision_recognize(b"fake-image")

    assert result == '{"raw_text":"abc"}'
