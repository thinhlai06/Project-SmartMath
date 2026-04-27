from __future__ import annotations

from unittest.mock import patch

import pytest

from app.services.ai.ocr_service import OCRService


def test_recognize_with_confidence_prefers_cloud() -> None:
    service = OCRService()

    with patch(
        "app.services.ai.ocr_service.OllamaService.vision_recognize_cloud",
        return_value='{"raw_text":"Cau 1: 2 + 2 = 4", "tokens":[{"text":"4","confidence":0.9}]}',
    ) as cloud_mock, patch(
        "app.services.ai.ocr_service.OllamaService.vision_recognize"
    ) as local_mock:
        result = service.recognize_with_confidence(b"image")

    assert result["raw_text"] == "Cau 1: 2 + 2 = 4"
    assert result["avg_confidence"] == 0.9
    cloud_mock.assert_called_once()
    local_mock.assert_not_called()


def test_recognize_with_confidence_fallbacks_to_local() -> None:
    service = OCRService()

    with patch(
        "app.services.ai.ocr_service.OllamaService.vision_recognize_cloud",
        side_effect=RuntimeError("cloud fail"),
    ), patch(
        "app.services.ai.ocr_service.OllamaService.vision_recognize",
        return_value='{"raw_text":"Cau 2: 5 - 3 = 2", "tokens":[]}',
    ) as local_mock:
        result = service.recognize_with_confidence(b"image")

    assert result["raw_text"] == "Cau 2: 5 - 3 = 2"
    local_mock.assert_called_once()


def test_recognize_with_confidence_raises_when_both_fail() -> None:
    service = OCRService()

    with patch(
        "app.services.ai.ocr_service.OllamaService.vision_recognize_cloud",
        side_effect=RuntimeError("cloud fail"),
    ), patch(
        "app.services.ai.ocr_service.OllamaService.vision_recognize",
        side_effect=RuntimeError("local fail"),
    ):
        with pytest.raises(RuntimeError, match="OCR that bai tren ca cloud va local"):
            service.recognize_with_confidence(b"image")
