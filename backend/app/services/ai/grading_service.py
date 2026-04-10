import logging
import json
import re
import unicodedata
from collections import Counter
from typing import List, Dict, Any, Optional
from .ocr_service import OCRService
from .ollama_service import OllamaService

logger = logging.getLogger(__name__)

class GradingService:
    def __init__(self):
        self.ocr = OCRService()

    def grade_submission(self, image_content: bytes, correct_answers: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Grade a student submission image.
        If correct_answers is provided, compares against it.
        If correct_answers is None/Empty, uses AI to self-solve and grade.
        """
        # 1. OCR Extraction
        try:
            ocr_payload = self.ocr.recognize_with_confidence(image_content)
            raw_text = str(ocr_payload.get("raw_text", "")).strip()
            ocr_tokens = ocr_payload.get("tokens", []) if isinstance(ocr_payload.get("tokens", []), list) else []
            ocr_avg_confidence = float(ocr_payload.get("avg_confidence", 0.0) or 0.0)
        except Exception as e:
            logger.error(f"OCR failed: {e}")
            import traceback
            traceback.print_exc()
            return {"error": f"OCR failed: {str(e)}", "raw_text": ""}

        if not raw_text:
            return {"error": "No text detected", "raw_text": ""}

        # 2. Grading Path
        if correct_answers:
            # Traditional Path: Parse & Compare
            extracted_answers = self._parse_answers_with_llm(raw_text, len(correct_answers))
            results = []
            total_score = 0
            total_max_score = 0
            
            for idx, expected in enumerate(correct_answers):
                q_id = expected.get('id', idx + 1)
                # Try to get answer by ID (string or int key)
                student_ans = extracted_answers.get(str(q_id)) or extracted_answers.get(q_id) or ""
                student_ans = str(student_ans).strip()

                comparison = self._compare_answers(student_ans, expected)
                is_correct = comparison["is_correct"]

                # Default 10 points per question if not specified
                points = self._normalize_points(expected.get('points', 10))
                grading_rule = str(expected.get("grading_rule", "all_or_nothing")).strip().lower()

                if grading_rule == "per_item" and comparison["total_items"] > 0:
                    ratio = comparison["matched_items"] / comparison["total_items"]
                    score = min(points, max(0, int(round(points * ratio))))
                else:
                    score = points if is_correct else 0

                feedback: Optional[str] = None
                if not is_correct and score > 0:
                    feedback = (
                        f"Đúng một phần ({comparison['matched_items']}/{comparison['total_items']} ý đúng)."
                    )

                answer_confidence, low_conf_tokens = self._estimate_answer_confidence(student_ans, ocr_tokens, ocr_avg_confidence)
                
                results.append({
                    "question_id": str(q_id),
                    "student_answer": student_ans,
                    "correct_answer": self._answer_to_display(expected.get("answer")),
                    "is_correct": is_correct,
                    "score": score,
                    "max_score": points,
                    "feedback": feedback,
                    "question_type": expected.get("question_type") or expected.get("answer_type"),
                    "ocr_confidence": answer_confidence,
                    "low_confidence_tokens": low_conf_tokens,
                })
                total_score += score
                total_max_score += points

            return {
                "total_score": total_score,
                "max_score": total_max_score,
                "results": results,
                "raw_text": raw_text,
                "extracted_json": extracted_answers,
                "ocr_tokens": ocr_tokens,
                "ocr_avg_confidence": ocr_avg_confidence,
            }
        else:
            # Auto-Solve Path
            return self._grade_without_key(raw_text, ocr_tokens, ocr_avg_confidence)

    def _grade_without_key(self, text: str, ocr_tokens: List[Dict[str, Any]], ocr_avg_confidence: float) -> Dict[str, Any]:
        """
        Ask LLM to identify questions, solve them, and grade the student.
        """
        prompt = f"""Bạn là giáo viên chấm bài Toán tiểu học Việt Nam (Lớp 1-3).
Dưới đây là nội dung OCR từ bài làm của học sinh:
---
{text}
---
NHIỆM VỤ CỦA BẠN:
1. Phân tích nội dung OCR, xác định từng câu hỏi. Lưu ý các từ khóa: "Câu", "Bài", "Bài giải", "Đáp số".
2. Đối với dạng "Bài toán có lời văn", hãy chú ý phần "Lời giải" và "Đáp số" của học sinh.
3. Tự giải từng câu hỏi để tìm ĐÁP ÁN ĐÚNG (Correct Answer).
4. Xác định CÂU TRẢ LỜI CỦA HỌC SINH (Student Answer).
5. So sánh và chấm điểm (Đúng/Sai). Thang điểm 10/câu.

YÊU CẦU ĐẦU RA (JSON Array):
[
  {{
    "question_id": "1",
    "question_type": "trắc nghiệm/tự luận/lời văn",
    "question_text": "Nội dung đề bài...",
    "reasoning": "Giải thích ngắn gọn cách giải...",
    "correct_answer": "Đáp án đúng ngắn gọn",
    "student_answer": "Đáp án học sinh đã viết",
    "is_correct": true,
    "score": 10,
    "max_score": 10,
    "feedback": "Nhận xét (ví dụ: Sai lời giải, tính toán sai...)"
  }}
]
CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC."""

        try:
            response = OllamaService.generate(prompt, temperature=0.1)
            # Parse JSON
            # Clean markdown code blocks
            clean = re.sub(r"```json|```", "", response).strip()
            # Try to fix partial JSON if needed, but for now expect valid JSON
            results = json.loads(clean)

            normalized_results = []
            for item in results:
                student_answer = str(item.get("student_answer", "")).strip()
                answer_confidence, low_conf_tokens = self._estimate_answer_confidence(
                    student_answer,
                    ocr_tokens,
                    ocr_avg_confidence,
                )
                item["ocr_confidence"] = answer_confidence
                item["low_confidence_tokens"] = low_conf_tokens
                normalized_results.append(item)
            
            total_score = sum(item.get('score', 0) for item in normalized_results)
            total_max_score = sum(item.get('max_score', 10) for item in normalized_results)
            
            return {
                "total_score": total_score,
                "max_score": total_max_score,
                "results": normalized_results,
                "raw_text": text,
                "extracted_json": {str(r['question_id']): r['student_answer'] for r in normalized_results},
                "ocr_tokens": ocr_tokens,
                "ocr_avg_confidence": ocr_avg_confidence,
            }
        except Exception as e:
            logger.error(f"Auto-grading failed: {e}")
            return {
                "error": "Failed to auto-grade", 
                "details": str(e),
                "raw_text": text
            }

    def _compare_answers(self, student: str, expected: Dict[str, Any]) -> Dict[str, int | bool]:
        answer_type = str(expected.get("answer_type", "text")).strip().lower()
        grading_rule = str(expected.get("grading_rule", "all_or_nothing")).strip().lower()
        correct = expected.get("answer")

        if answer_type == "number":
            student_number = self._extract_number(student)
            correct_number = self._extract_number(correct)
            is_correct = (
                student_number is not None
                and correct_number is not None
                and abs(student_number - correct_number) < 1e-9
            )
            return {
                "is_correct": is_correct,
                "matched_items": 1 if is_correct else 0,
                "total_items": 1,
            }

        if answer_type == "boolean":
            student_bool = self._parse_boolean(student)
            correct_bool = self._parse_boolean(correct)
            is_correct = student_bool is not None and correct_bool is not None and student_bool == correct_bool
            return {
                "is_correct": is_correct,
                "matched_items": 1 if is_correct else 0,
                "total_items": 1,
            }

        if answer_type in {"ordered_list", "unordered_list", "multi_blank"}:
            expected_items = self._to_items(correct)
            student_items = self._to_items(student)

            if len(student_items) <= 1 and len(expected_items) > 1:
                detected_numbers = re.findall(r"-?\d+(?:[\.,]\d+)?", student)
                if len(detected_numbers) >= len(expected_items):
                    student_items = detected_numbers[: len(expected_items)]

            normalized_expected = [self._normalize_text(item) for item in expected_items]
            normalized_student = [self._normalize_text(item) for item in student_items]

            if not normalized_expected:
                return {
                    "is_correct": len(normalized_student) == 0,
                    "matched_items": 0,
                    "total_items": 0,
                }

            if answer_type == "unordered_list":
                expected_counter = Counter(normalized_expected)
                student_counter = Counter(normalized_student)
                matched = sum(min(expected_counter[item], student_counter.get(item, 0)) for item in expected_counter)
                expected_total = sum(expected_counter.values())
                student_total = sum(student_counter.values())
                total = max(expected_total, student_total)
                is_correct = expected_counter == student_counter

                if grading_rule == "per_item":
                    return {
                        "is_correct": is_correct,
                        "matched_items": matched,
                        "total_items": total,
                    }

                return {
                    "is_correct": is_correct,
                    "matched_items": total if is_correct else 0,
                    "total_items": total,
                }

            paired_length = min(len(normalized_student), len(normalized_expected))
            matched = sum(
                1
                for index in range(paired_length)
                if normalized_student[index] == normalized_expected[index]
            )
            expected_total = len(normalized_expected)
            student_total = len(normalized_student)
            total = max(expected_total, student_total)
            is_same_length = student_total == expected_total
            is_correct = is_same_length and matched == expected_total

            if grading_rule == "per_item":
                return {
                    "is_correct": is_correct,
                    "matched_items": matched,
                    "total_items": total,
                }

            return {
                "is_correct": is_correct,
                "matched_items": total if is_correct else 0,
                "total_items": total,
            }

        # Legacy/default text compare
        normalized_student = self._normalize_text(student)
        normalized_correct = self._normalize_text(correct)

        if normalized_student == normalized_correct:
            return {"is_correct": True, "matched_items": 1, "total_items": 1}

        # Backward-compatible number fallback for values like "5 qua" vs "5"
        correct_number = self._extract_number(correct)
        student_number = self._extract_number(student)
        if correct_number is not None and student_number is not None and abs(student_number - correct_number) < 1e-9:
            return {"is_correct": True, "matched_items": 1, "total_items": 1}

        return {"is_correct": False, "matched_items": 0, "total_items": 1}

    def _normalize_points(self, raw_points: Any) -> int:
        try:
            points = int(raw_points)
        except (TypeError, ValueError):
            points = 10
        if points <= 0:
            return 10
        return points

    def _normalize_text(self, value: Any) -> str:
        text = str(value or "")
        normalized = unicodedata.normalize("NFD", text)
        normalized = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
        normalized = normalized.replace("đ", "d").replace("Đ", "d")
        normalized = re.sub(r"\s+", " ", normalized).strip().lower()
        return normalized

    def _extract_number(self, value: Any) -> Optional[float]:
        if isinstance(value, (int, float)):
            return float(value)

        text = str(value or "").strip()
        if not text:
            return None

        matches = re.findall(r"-?\d+(?:[\.,]\d+)?", text)
        if not matches:
            return None

        candidate = matches[0].replace(",", ".")
        try:
            return float(candidate)
        except ValueError:
            return None

    def _parse_boolean(self, value: Any) -> Optional[bool]:
        text = self._normalize_text(value)
        if text in {"true", "1", "yes", "co", "dung"}:
            return True
        if text in {"false", "0", "no", "khong", "sai"}:
            return False
        return None

    def _to_items(self, value: Any) -> List[str]:
        if value is None:
            return []

        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]

        raw = str(value).strip()
        if not raw:
            return []

        if any(separator in raw for separator in ["\n", ",", ";", "|"]):
            tokens = re.split(r"[\n,;|]+", raw)
        else:
            tokens = [raw]

        return [token.strip() for token in tokens if token.strip()]

    def _answer_to_display(self, value: Any) -> str:
        if isinstance(value, bool):
            return "Đúng" if value else "Sai"
        if isinstance(value, list):
            return ", ".join(str(item) for item in value)
        return str(value if value is not None else "")

    def _parse_answers_with_llm(self, text: str, count: int) -> Dict[str, str]:
        prompt = f"""Bạn là trợ lý chấm thi. Hãy trích xuất {count} câu trả lời từ văn bản OCR bài làm học sinh dưới đây.
Văn bản OCR:
---
{text}
---

Yêu cầu:
- Trả về JSON object với key là số thứ tự câu hỏi (1, 2, ...).
- Value là nội dung câu trả lời của học sinh.
- Nếu không tìm thấy, để trống "".

Ví dụ JSON:
{{
  "1": "5 quả",
  "2": "10"
}}

CHỈ TRẢ VỀ JSON."""
        
        try:
            response = OllamaService.generate(prompt, temperature=0.1)
            # Parse JSON
            # Clean markdown code blocks
            clean = re.sub(r"```json|```", "", response).strip()
            return json.loads(clean)
        except Exception as e:
            logger.error(f"LLM Parsing failed: {e}")
            return {}

    def _estimate_answer_confidence(
        self,
        student_answer: str,
        ocr_tokens: List[Dict[str, Any]],
        fallback_confidence: float,
    ) -> tuple[float, List[Dict[str, Any]]]:
        answer = (student_answer or "").strip().lower()
        if not answer:
            return round(fallback_confidence * 100, 1), []

        answer_terms = [term for term in re.split(r"\s+", answer) if term]
        matched: List[Dict[str, Any]] = []

        if answer_terms:
            for token in ocr_tokens:
                token_text = str(token.get("text", "")).strip().lower()
                if not token_text:
                    continue
                if any(term in token_text or token_text in term for term in answer_terms):
                    try:
                        confidence = float(token.get("confidence", 0.0) or 0.0)
                    except (TypeError, ValueError):
                        confidence = 0.0
                    confidence = max(0.0, min(1.0, confidence))
                    matched.append({"text": token.get("text", ""), "confidence": round(confidence * 100, 1)})

        if not matched:
            return round(fallback_confidence * 100, 1), []

        avg = sum(item["confidence"] for item in matched) / len(matched)
        low_tokens = [item for item in matched if item["confidence"] < 85.0]
        return round(avg, 1), low_tokens
