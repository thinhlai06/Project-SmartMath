"""Tests for ChatService intent detection and context injection."""
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import pytest
from unittest.mock import patch, MagicMock

from app.services.ai.chat_service import ChatService


class TestIntentDetection:
    """Tests for ChatService._detect_intent."""

    def _make_service(self):
        db = MagicMock()
        return ChatService(db, teacher_id=1)

    def test_detect_class_insights(self):
        svc = self._make_service()
        assert svc._detect_intent("Phân tích kết quả lớp tôi") == "class_insights"
        assert svc._detect_intent("thống kê lỗi phổ biến") == "class_insights"

    def test_detect_student_spotlight(self):
        svc = self._make_service()
        assert svc._detect_intent("Em Minh tiến bộ thế nào?") == "student_spotlight"
        assert svc._detect_intent("Kết quả em Hoa") == "student_spotlight"

    def test_detect_exercise_request(self):
        svc = self._make_service()
        assert svc._detect_intent("Sinh bài tập phép cộng") == "exercise_request"
        assert svc._detect_intent("Tạo đề kiểm tra cho lớp") == "exercise_request"

    def test_detect_lesson_plan(self):
        svc = self._make_service()
        assert svc._detect_intent("Viết giáo án cho tiết dạy ngày mai") == "lesson_plan"
        assert svc._detect_intent("Kế hoạch bài dạy 45 phút") == "lesson_plan"

    def test_detect_general(self):
        svc = self._make_service()
        assert svc._detect_intent("Xin chào!") == "general"
        assert svc._detect_intent("Cảm ơn nhiều") == "general"

    def test_priority_lesson_plan_over_exercise_request(self):
        svc = self._make_service()
        assert svc._detect_intent("Giáo án tạo bài tập phân hóa") == "lesson_plan"


class TestBuildPrompt:
    """Tests for ChatService._build_prompt."""

    def _make_service(self):
        db = MagicMock()
        return ChatService(db, teacher_id=1)

    def test_general_no_context(self):
        svc = self._make_service()
        prompt, ctx = svc._build_prompt("Xin chào", intent="general")
        assert prompt == "Xin chào"
        assert ctx is None

    def test_class_insights_without_class_id(self):
        svc = self._make_service()
        prompt, ctx = svc._build_prompt("Thống kê lớp", intent="class_insights")
        assert prompt == "Thống kê lớp"
        assert ctx is None

    @patch("app.services.ai.chat_service.ChatService._get_class_context")
    def test_class_insights_with_class_id(self, mock_ctx):
        mock_ctx.return_value = "📋 Lớp 1A"
        svc = self._make_service()
        prompt, ctx = svc._build_prompt("Thống kê lớp", class_id=1, intent="class_insights")
        assert "DỮ LIỆU THAM KHẢO" in prompt
        assert "📋 Lớp 1A" in prompt

    @patch("app.services.ai.chat_service.ChatService._get_student_context")
    def test_student_spotlight_with_ids(self, mock_ctx):
        mock_ctx.return_value = ("👤 Minh", {"student_spotlight": {}})
        svc = self._make_service()
        prompt, ctx = svc._build_prompt("Em Minh", class_id=1, student_id=5, intent="student_spotlight")
        assert "👤 Minh" in prompt
        assert ctx is not None

    def test_context_injection_error_handled(self):
        """Context errors should not crash — just no context appended."""
        svc = self._make_service()
        with patch.object(svc, "_get_class_context", side_effect=RuntimeError("db error")):
            prompt, ctx = svc._build_prompt("Thống kê lớp", class_id=1, intent="class_insights")
            assert prompt == "Thống kê lớp"
            assert ctx is None


class TestGeminiServiceConfig:
    """Tests for GeminiService basic checks."""

    def test_is_available_without_key(self):
        from app.services.ai.gemini_service import GeminiService
        with patch("app.services.ai.gemini_service.settings") as mock_settings:
            mock_settings.GEMINI_API_KEY = ""
            assert GeminiService.is_available() is False

    def test_is_available_with_key(self):
        from app.services.ai.gemini_service import GeminiService
        with patch("app.services.ai.gemini_service.settings") as mock_settings:
            mock_settings.GEMINI_API_KEY = "test-key-123"
            assert GeminiService.is_available() is True
