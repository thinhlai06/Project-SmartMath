from __future__ import annotations

from unittest.mock import patch

import pytest
import requests

from app.services.ai.ollama_service import OllamaService


class _FakeResponse:
    def __init__(self, status_code: int, payload: dict):
        self.status_code = status_code
        self._payload = payload
        self.text = str(payload)

    def json(self) -> dict:
        return self._payload

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise requests.HTTPError(f"HTTP {self.status_code}", response=self)


def test_ollama_is_running_true() -> None:
    with patch("app.services.ai.ollama_service.requests.get", return_value=_FakeResponse(200, {})):
        assert OllamaService.is_running() is True


def test_get_loaded_models_from_ps() -> None:
    response = {
        "models": [
            {"name": "qwen2.5:3b"},
            {"model": "nomic-embed-text:latest"},
        ]
    }
    with patch("app.services.ai.ollama_service.requests.get", return_value=_FakeResponse(200, response)):
        assert OllamaService.get_loaded_models() == ["qwen2.5:3b", "nomic-embed-text:latest"]


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


def test_vision_recognize_cloud_success() -> None:
    payload = {
        "message": {
            "content": '{"raw_text":"Bai 1", "tokens": []}'
        }
    }

    with patch("app.services.ai.ollama_service.settings.OLLAMA_CLOUD_API_KEY", "test-key"), patch(
        "app.services.ai.ollama_service.settings.OLLAMA_CLOUD_API_BASE", "https://example.ai/api"
    ), patch("app.services.ai.ollama_service.requests.post", return_value=_FakeResponse(200, payload)) as mock_post:
        result = OllamaService.vision_recognize_cloud(b"fake-image")

    assert "raw_text" in result
    assert mock_post.call_args.kwargs["headers"]["Authorization"] == "Bearer test-key"
    assert mock_post.call_args.kwargs["json"]["model"]


def test_vision_recognize_cloud_requires_api_key() -> None:
    with patch("app.services.ai.ollama_service.settings.OLLAMA_CLOUD_API_KEY", ""):
        with pytest.raises(ValueError):
            OllamaService.vision_recognize_cloud(b"fake-image")


def test_vision_recognize_cloud_timeout() -> None:
    with patch("app.services.ai.ollama_service.settings.OLLAMA_CLOUD_API_KEY", "test-key"), patch(
        "app.services.ai.ollama_service.requests.post",
        side_effect=requests.exceptions.Timeout(),
    ):
        with pytest.raises(TimeoutError):
            OllamaService.vision_recognize_cloud(b"fake-image")


def test_vision_recognize_cloud_model_not_found_detail() -> None:
    error_payload = {"error": "model 'deepseek-ocr:latest-cloud' not found"}
    with patch("app.services.ai.ollama_service.settings.OLLAMA_CLOUD_API_KEY", "test-key"), patch(
        "app.services.ai.ollama_service.requests.post",
        return_value=_FakeResponse(404, error_payload),
    ):
        with pytest.raises(RuntimeError, match="model 'deepseek-ocr:latest-cloud' not found"):
            OllamaService.vision_recognize_cloud(b"fake-image")


def test_vision_recognize_cloud_retries_without_cloud_suffix() -> None:
    not_found = _FakeResponse(404, {"error": "model 'deepseek-ocr:latest-cloud' not found"})
    success = _FakeResponse(200, {"message": {"content": '{"raw_text":"ok"}'}})

    with patch("app.services.ai.ollama_service.settings.OLLAMA_CLOUD_API_KEY", "test-key"), patch(
        "app.services.ai.ollama_service.requests.post",
        side_effect=[not_found, success],
    ) as mock_post:
        result = OllamaService.vision_recognize_cloud(b"fake-image", model="deepseek-ocr:latest-cloud")

    assert "raw_text" in result
    assert mock_post.call_count == 2
    first_model = mock_post.call_args_list[0].kwargs["json"]["model"]
    second_model = mock_post.call_args_list[1].kwargs["json"]["model"]
    assert first_model == "deepseek-ocr:latest-cloud"
    assert second_model == "deepseek-ocr:latest"


def test_normalize_cloud_api_base_auto_fixes_ollama_host() -> None:
    normalized = OllamaService._normalize_cloud_api_base("https://api.ollama.com/v1")
    assert normalized == "https://ollama.com/api"


def test_normalize_cloud_api_base_adds_default_path() -> None:
    normalized = OllamaService._normalize_cloud_api_base("https://ollama.com")
    assert normalized == "https://ollama.com/api"


def test_normalize_cloud_api_base_strips_chat_suffix() -> None:
    normalized = OllamaService._normalize_cloud_api_base("https://ollama.com/api/chat")
    assert normalized == "https://ollama.com/api"


def test_generate_uses_default_qwen_model() -> None:
    payload = {"message": {"content": "ok"}}
    with patch("app.services.ai.ollama_service.settings.OLLAMA_TEXT_MODEL", "qwen2.5:3b"), patch(
        "app.services.ai.ollama_service.requests.post",
        return_value=_FakeResponse(200, payload),
    ) as mock_post:
        OllamaService.generate("test prompt")

    assert mock_post.call_args.kwargs["json"]["model"] == "qwen2.5:3b"
