"""
Chat Service - Orchestrator for teacher AI chatbot.
Handles intent detection, context injection, and Gemini API calls.
"""
import logging
from typing import Any, AsyncIterator, Dict, List, Optional

from sqlalchemy.orm import Session

from app.models.math_class import MathClass
from app.services.ai.gemini_service import GeminiService

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = """Bạn là trợ lý AI cho giáo viên Toán tiểu học Việt Nam (Lớp 1-3).
Hệ thống: Smart-MathAI — nền tảng giáo dục Toán theo phương pháp CPA.
Chương trình: GDPT 2018 Bộ GD&ĐT Việt Nam.

Rules:
- Always respond in Vietnamese
- Only elementary math (Grade 1-3), NO algebra/equations
- Friendly, professional language for teachers
- CPA methodology: Concrete → Pictorial → Abstract
- When class data provided, analyze specifically (don't generalize)
- If uncertain, say so — never fabricate data
- Format with Markdown when appropriate"""

HOMEWORK_ANALYSIS_PROMPT = """Bạn là chuyên gia phân tích bài làm Toán tiểu học.
Hãy phân tích ảnh bài làm của học sinh và:
1. Nhận diện các lỗi sai (nếu có) và phân loại lỗi
2. Đánh giá mức độ hoàn thành
3. Gợi ý phản hồi sư phạm cho giáo viên
4. Đề xuất cách sửa lỗi theo phương pháp CPA (Concrete → Pictorial → Abstract)

Hãy trả lời bằng tiếng Việt, rõ ràng và chi tiết."""

WHITEBOARD_VERIFICATION_PROMPT = """Bạn là chuyên gia kiểm tra phương pháp giảng dạy Toán tiểu học.
Hãy kiểm tra ảnh bảng viết/giải bài trên bảng và:
1. Kiểm tra phương pháp giải có phù hợp với trình độ tiểu học không
2. Phát hiện nếu có sử dụng ký hiệu đại số/phương trình (không phù hợp)
3. Đánh giá độ rõ ràng, trình bày
4. Gợi ý cách trình bày tốt hơn theo CPA

Hãy trả lời bằng tiếng Việt, rõ ràng và chi tiết."""


class ChatService:
    """Orchestrates chatbot interactions with intent detection and context injection."""

    def __init__(self, db: Session, teacher_id: int):
        self.db = db
        self.teacher_id = teacher_id

    def handle_message(
        self,
        message: str,
        class_id: Optional[int] = None,
        student_id: Optional[int] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """Process a chat message and return response.

        Returns:
            {"content": str, "message_type": str, "context": dict|None}
        """
        intent = self._detect_intent(message)
        prompt, context_data = self._build_prompt(message, class_id, student_id, intent)

        content = GeminiService.generate(
            prompt=prompt,
            system=SYSTEM_INSTRUCTION,
            temperature=0.7,
            history=history,
        )

        return {
            "content": content,
            "message_type": intent,
            "context": context_data,
        }

    async def handle_message_stream(
        self,
        message: str,
        class_id: Optional[int] = None,
        student_id: Optional[int] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> AsyncIterator[str]:
        """Stream a chat response chunk by chunk.

        Yields:
            Text chunks from Gemini.
        """
        intent = self._detect_intent(message)
        prompt, _ = self._build_prompt(message, class_id, student_id, intent)

        async for chunk in GeminiService.generate_stream(
            prompt=prompt,
            system=SYSTEM_INSTRUCTION,
            temperature=0.7,
            history=history,
        ):
            yield chunk

    def handle_image(
        self,
        image_content: bytes,
        prompt: Optional[str] = None,
        analysis_type: str = "homework",
    ) -> Dict[str, Any]:
        """Analyze an image (homework or whiteboard).

        Args:
            image_content: Raw image bytes.
            prompt: Optional additional prompt from user.
            analysis_type: "homework" or "whiteboard".

        Returns:
            {"content": str, "message_type": str, "context": None}
        """
        if analysis_type == "whiteboard":
            system_prompt = WHITEBOARD_VERIFICATION_PROMPT
        else:
            system_prompt = HOMEWORK_ANALYSIS_PROMPT

        full_prompt = system_prompt
        if prompt:
            full_prompt += f"\n\nYêu cầu thêm từ giáo viên: {prompt}"

        content = GeminiService.analyze_image(
            image_content=image_content,
            prompt=full_prompt,
        )

        return {
            "content": content,
            "message_type": f"image_{analysis_type}",
            "context": None,
        }

    # ------------------------------------------------------------------
    # Intent Detection
    # ------------------------------------------------------------------

    INTENT_KEYWORDS = {
        "lesson_plan": [
            "giáo án", "lesson plan", "kế hoạch bài dạy", "tiết dạy",
            "45 phút", "kế hoạch dạy", "lên giáo án",
        ],
        "exercise_request": [
            "sinh bài", "tạo bài", "generate", "sinh đề", "tạo đề",
            "sinh câu hỏi", "tạo câu hỏi", "phân hóa",
        ],
        "student_spotlight": [
            "học sinh", "em ", "tiến bộ", "spotlight", "cá nhân",
            "kết quả em", "điểm em",
        ],
        "class_insights": [
            "lớp", "thống kê", "analytics", "sai nhiều",
            "lỗi phổ biến", "kết quả lớp", "phân tích lớp",
        ],
        "cpa_advisor": [
            "phương pháp", "cpa", "concrete", "pictorial", "abstract",
            "cách dạy", "strategy", "chiến lược",
        ],
    }

    def _detect_intent(self, message: str) -> str:
        """Keyword-based intent detection with priority ordering."""
        lower = message.lower()

        for intent in [
            "lesson_plan",
            "exercise_request",
            "student_spotlight",
            "class_insights",
            "cpa_advisor",
        ]:
            for kw in self.INTENT_KEYWORDS[intent]:
                if kw in lower:
                    logger.info("[Chat] Detected intent=%s for keyword='%s'", intent, kw)
                    return intent

        return "general"

    # ------------------------------------------------------------------
    # Prompt Building with Context Injection
    # ------------------------------------------------------------------

    def _build_prompt(
        self,
        message: str,
        class_id: Optional[int] = None,
        student_id: Optional[int] = None,
        intent: Optional[str] = None,
    ) -> tuple:
        """Build the final prompt with context injection based on intent.

        Returns:
            (prompt_str, context_data_dict_or_None)
        """
        if intent is None:
            intent = self._detect_intent(message)

        context_text = ""
        context_data = None

        try:
            if intent == "class_insights" and class_id:
                context_text = self._get_class_context(class_id)
            elif intent == "student_spotlight" and class_id and student_id:
                context_text, context_data = self._get_student_context(class_id, student_id)
            elif intent == "student_spotlight" and class_id:
                context_text = self._get_class_context(class_id)
                context_text += "\n\n💡 Gợi ý: Hãy chọn một học sinh cụ thể để xem chi tiết."
            elif intent == "cpa_advisor" and class_id:
                context_text = self._get_rag_context(message, class_id)
            elif intent == "cpa_advisor":
                context_text = self._get_rag_context(message, None)
            elif intent == "lesson_plan":
                context_text = self._get_lesson_plan_context(message, class_id)
            elif intent == "exercise_request":
                context_text = self._get_exercise_request_context(message, class_id)
        except Exception as exc:
            logger.warning("[Chat] Context injection failed for intent=%s: %s", intent, exc)

        if context_text:
            prompt = f"{message}\n\n---\nDỮ LIỆU THAM KHẢO:\n{context_text}"
        else:
            prompt = message

        return prompt, context_data

    # ------------------------------------------------------------------
    # Context Providers
    # ------------------------------------------------------------------

    def _get_class_context(self, class_id: int) -> str:
        """Get class analytics context for Class Insights Chat."""
        from app.services.ai.analytics_service import AnalyticsService

        math_class = (
            self.db.query(MathClass)
            .filter(MathClass.id == class_id, MathClass.teacher_id == self.teacher_id)
            .first()
        )
        if not math_class:
            return "Không tìm thấy lớp hoặc không có quyền truy cập."

        analytics = AnalyticsService(self.db).analyze_class_errors(class_id)

        lines = [
            f"📋 Lớp: {math_class.class_name} (Khối {math_class.grade})",
        ]

        perf = analytics.get("student_performance", [])
        if perf:
            lines.append(f"Tổng số học sinh có dữ liệu: {len(perf)}")
            bottom = perf[:3]
            if bottom:
                lines.append("Học sinh cần hỗ trợ nhất:")
                for s in bottom:
                    lines.append(f"  - {s['student']}: {s['average_score']}/10 ({s['assignment_count']} bài)")

        weak = analytics.get("weak_topics", [])
        if weak:
            lines.append("Chủ đề yếu nhất:")
            for t in weak[:5]:
                lines.append(f"  - {t['topic']}: {t['accuracy']}% đúng ({t['total_questions']} câu)")

        mistakes = analytics.get("common_mistakes", [])
        if mistakes:
            lines.append("Lỗi phổ biến nhất:")
            for m in mistakes[:5]:
                lines.append(f"  - {m['type']}: {m['count']} lần")

        return "\n".join(lines)

    def _get_student_context(self, class_id: int, student_id: int) -> tuple:
        """Get student spotlight context. Returns (text, spotlight_data)."""
        from app.services.ai.analytics_service import AnalyticsService

        data = AnalyticsService(self.db).get_student_spotlight(class_id, student_id)
        if "error" in data:
            return data["error"], None

        lines = [
            f"👤 Học sinh: {data['student_name']} (ID: {data['student_id']})",
            f"Xếp loại: {data.get('tier') or 'Chưa xếp'}",
            f"Tổng bài tập: {data['total_worksheets']}",
            f"Điểm trung bình: {data['average_score']}/10 (lớp: {data['class_average_score']}/10)",
        ]

        trend = data.get("score_trend", [])
        if trend:
            recent = trend[-5:]
            lines.append("Xu hướng điểm gần đây:")
            for t in recent:
                lines.append(f"  - {t['date'][:10]}: {t['score']}/{t['max_score']}")

        errors = data.get("error_distribution", [])
        if errors:
            lines.append("Phân bố lỗi:")
            for e in errors[:5]:
                lines.append(f"  - {e['error_type']}: {e['count']} lần")

        recent_err = data.get("recent_errors", [])
        if recent_err:
            lines.append("Lỗi gần đây:")
            for e in recent_err[:3]:
                detail = e.get("error_detail") or e["error_type"]
                lines.append(f"  - {detail}")
                if e.get("question_text"):
                    lines.append(f"    Câu hỏi: {e['question_text']}")

        context_text = "\n".join(lines)
        return context_text, {"student_spotlight": data}

    def _get_rag_context(self, message: str, class_id: Optional[int]) -> str:
        """Get RAG context from curriculum documents."""
        grade = None
        if class_id:
            math_class = (
                self.db.query(MathClass)
                .filter(MathClass.id == class_id, MathClass.teacher_id == self.teacher_id)
                .first()
            )
            if math_class:
                grade = math_class.grade

        if not grade:
            for g in [1, 2, 3]:
                if f"lớp {g}" in message.lower() or f"lop {g}" in message.lower():
                    grade = g
                    break

        if not grade:
            return "Không xác định được khối lớp. Vui lòng chỉ rõ lớp 1, 2 hoặc 3."

        try:
            from app.services.ai.rag_service import RAGService
            docs = RAGService().retrieve(query=message, grade=grade, k=3)
        except Exception as exc:
            logger.warning("[Chat] RAG retrieval failed: %s", exc)
            return "Không thể truy xuất tài liệu tham khảo lúc này."

        if not docs:
            return f"Không tìm thấy tài liệu tham khảo cho khối {grade}."

        lines = [f"📚 Tài liệu tham khảo (Khối {grade}):"]
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get("source", "SGK")
            content = doc.page_content[:500]
            lines.append(f"\n[{i}] Nguồn: {source}")
            lines.append(content)

        return "\n".join(lines)

    def _get_lesson_plan_context(self, message: str, class_id: Optional[int]) -> str:
        """Get context for Lesson Plan Chat."""
        rag_context = self._get_rag_context(message, class_id)

        template = """\n\n📝 Gợi ý cấu trúc giáo án 45 phút:
1. Khởi động (5 phút): Trò chơi/ôn bài cũ
2. Hình thành kiến thức mới (15 phút):
   - Concrete: Hoạt động thực hành với đồ vật
   - Pictorial: Vẽ hình/sơ đồ minh họa
   - Abstract: Viết phép tính/quy tắc
3. Luyện tập (15 phút): Bài tập cá nhân + nhóm
4. Vận dụng (5 phút): Bài toán thực tế
5. Củng cố - Dặn dò (5 phút)"""

        return rag_context + template

    def _get_exercise_request_context(self, message: str, class_id: Optional[int]) -> str:
        """Get context for Natural Language Exercise Request."""
        grade_info = ""
        if class_id:
            math_class = (
                self.db.query(MathClass)
                .filter(MathClass.id == class_id, MathClass.teacher_id == self.teacher_id)
                .first()
            )
            if math_class:
                grade_info = f"Lớp hiện tại: {math_class.class_name} (Khối {math_class.grade})"

        context = f"""📝 Hệ thống Smart-MathAI hỗ trợ sinh bài tập tự động.
{grade_info}

Các loại bài tập có thể sinh:
- Bài tập CPA (Concrete → Pictorial → Abstract)
- Bài tập phân hóa (Foundation / Standard / Extension / Advanced)

Thông tin cần để sinh bài tập:
- Khối lớp (1, 2, hoặc 3)
- Chủ đề (VD: phép cộng có nhớ, phép nhân bảng 3...)
- Mục tiêu bài học
- Số lượng câu hỏi

Hãy giúp giáo viên làm rõ yêu cầu, sau đó hướng dẫn sử dụng tính năng "Sinh bài tập" trên giao diện."""

        return context
