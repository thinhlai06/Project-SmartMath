import logging
import json
import re
import unicodedata
from collections import Counter
from typing import List, Dict, Any, Optional
from .ocr_service import OCRService
from .ollama_service import OllamaService

logger = logging.getLogger(__name__)


ALLOWED_ERROR_TYPES = {
    "tinh_sai",
    "nham_phep_tinh",
    "thieu_don_vi",
    "sai_loi_giai",
    "doc_de_sai",
    "viet_sai_so",
    "bo_sot_cau",
    "khac",
}

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
                parsed_answer = extracted_answers.get(str(q_id)) or extracted_answers.get(q_id) or ""
                question_text: Optional[str] = None
                if isinstance(parsed_answer, dict):
                    question_text = str(parsed_answer.get("question_text") or "").strip() or None
                    student_ans = str(parsed_answer.get("answer") or "").strip()
                else:
                    student_ans = str(parsed_answer).strip()

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

                error_type: Optional[str] = None
                error_detail: Optional[str] = None
                if not is_correct:
                    error_type = self._normalize_error_type(comparison.get("error_hint"))
                    error_detail = self._generate_rule_based_detail(
                        {
                            "error_type": error_type,
                            "student_answer": student_ans,
                            "correct_answer": self._answer_to_display(expected.get("answer")),
                        }
                    )

                feedback: Optional[str] = None
                if not is_correct and score > 0:
                    feedback = (
                        f"Đúng một phần ({comparison['matched_items']}/{comparison['total_items']} ý đúng)."
                    )

                answer_confidence, low_conf_tokens = self._estimate_answer_confidence(student_ans, ocr_tokens, ocr_avg_confidence)
                
                results.append({
                    "question_id": str(q_id),
                    "question_text": question_text,
                    "student_answer": student_ans,
                    "correct_answer": self._answer_to_display(expected.get("answer")),
                    "is_correct": is_correct,
                    "score": score,
                    "max_score": points,
                    "feedback": feedback,
                    "question_type": expected.get("question_type") or expected.get("answer_type"),
                    "error_type": error_type,
                    "error_detail": error_detail,
                    "ocr_confidence": answer_confidence,
                    "low_confidence_tokens": low_conf_tokens,
                })
                total_score += score
                total_max_score += points

            results = self._enrich_errors_with_llm(results, raw_text)

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
        Two-step strategy for small model stability:
        1) extract + solve
        2) grade + classify errors
        """
        try:
            extracted = self._extract_and_solve(text)
            if not extracted:
                return {
                    "error": "Failed to auto-grade",
                    "details": "Khong trich xuat duoc cau hoi tu OCR",
                    "raw_text": text,
                }

            results = self._grade_and_analyze(extracted, text)

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

    def _extract_and_solve(self, text: str) -> List[Dict[str, Any]]:
        prompt = f"""Bạn là giáo viên Toán tiểu học. Đọc bài OCR và làm 2 việc:
1. Xác định từng câu hỏi (tìm "Câu", "Bài", số thứ tự)
2. Với mỗi câu: ghi lại đề bài, đáp án học sinh viết, và tự giải tìm đáp án đúng

Bài OCR:
---
{text}
---

Trả về JSON array, mỗi item:
{{"id":"1","question":"đề bài","student":"đáp án HS","correct":"đáp án đúng"}}
CHỈ JSON."""

        response = OllamaService.generate(prompt, temperature=0.1)
        parsed = self._safe_parse_json_array(response)

        normalized: List[Dict[str, Any]] = []
        for item in parsed:
            if not isinstance(item, dict):
                continue
            qid = str(item.get("id") or item.get("question_id") or "").strip()
            if not qid:
                continue
            normalized.append(
                {
                    "id": qid,
                    "question": str(item.get("question") or item.get("question_text") or "").strip(),
                    "student": str(item.get("student") or item.get("student_answer") or "").strip(),
                    "correct": str(item.get("correct") or item.get("correct_answer") or "").strip(),
                }
            )

        return normalized

    def _grade_and_analyze(self, extracted: List[Dict[str, Any]], raw_text: str) -> List[Dict[str, Any]]:
        items_text = "\n".join(
            f"Câu {entry['id']}: Đề=\"{entry.get('question', '')}\" | HS=\"{entry.get('student', '')}\" | Đúng=\"{entry.get('correct', '')}\""
            for entry in extracted
        )

        prompt = f"""So sánh đáp án học sinh với đáp án đúng. Chấm điểm và phân tích lỗi.

{items_text}

Với mỗi câu SAI, chọn error_type:
tinh_sai|nham_phep_tinh|thieu_don_vi|sai_loi_giai|doc_de_sai|viet_sai_so|bo_sot_cau|khac

JSON array, mỗi item:
{{"question_id":"1","question_text":"...","correct_answer":"...","student_answer":"...",
"is_correct":true,"score":10,"max_score":10,"reasoning":"cách giải",
"feedback":"nhận xét","error_type":null,"error_detail":null}}
CHỈ JSON."""

        response = OllamaService.generate(prompt, temperature=0.1)
        raw_results = self._safe_parse_json_array(response)
        normalized_results: List[Dict[str, Any]] = []

        extracted_map = {str(item.get("id", "")): item for item in extracted}
        for item in raw_results:
            if not isinstance(item, dict):
                continue

            qid = str(item.get("question_id") or item.get("id") or "").strip()
            if not qid:
                continue

            seed = extracted_map.get(qid, {})
            student_answer = str(item.get("student_answer") or seed.get("student") or "").strip()
            correct_answer = str(item.get("correct_answer") or seed.get("correct") or "").strip()
            question_text = str(item.get("question_text") or seed.get("question") or "").strip()

            is_correct = bool(item.get("is_correct", False))
            max_score = self._normalize_points(item.get("max_score", 10))
            try:
                score = int(item.get("score", max_score if is_correct else 0))
            except (TypeError, ValueError):
                score = max_score if is_correct else 0
            score = max(0, min(max_score, score))

            rule_check = self._verify_correctness(student_answer, correct_answer)
            if rule_check is not None and rule_check != is_correct:
                logger.info(
                    "Overriding LLM is_correct for Q%s: LLM=%s -> Rule=%s",
                    qid,
                    is_correct,
                    rule_check,
                )
                is_correct = rule_check
                score = max_score if is_correct else 0

            error_type = self._normalize_error_type(item.get("error_type"))
            error_detail = str(item.get("error_detail") or "").strip() or None
            if not is_correct:
                if not error_type:
                    error_type = self._detect_error_hint(student_answer, correct_answer, "text")
                if not error_detail:
                    error_detail = self._generate_rule_based_detail(
                        {
                            "error_type": error_type,
                            "student_answer": student_answer,
                            "correct_answer": correct_answer,
                        }
                    )
            else:
                error_type = None
                error_detail = None
                score = max_score

            normalized_results.append(
                {
                    "question_id": qid,
                    "question_text": question_text,
                    "student_answer": student_answer,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct,
                    "score": score,
                    "max_score": max_score,
                    "reasoning": str(item.get("reasoning") or "").strip() or None,
                    "feedback": str(item.get("feedback") or "").strip() or None,
                    "error_type": error_type,
                    "error_detail": error_detail,
                    "question_type": str(item.get("question_type") or "").strip() or None,
                }
            )

        return self._enrich_errors_with_llm(normalized_results, raw_text)

    def _enrich_errors_with_llm(self, results: List[Dict[str, Any]], raw_text: str) -> List[Dict[str, Any]]:
        """Enrich rule-based wrong answers with short Vietnamese details from LLM."""
        wrong = [item for item in results if not item.get("is_correct") and item.get("error_type")]
        if not wrong:
            return results

        summary = "\n".join(
            (
                f"Câu {item.get('question_id')}: HS=\"{item.get('student_answer', '')}\" "
                f"Đúng=\"{item.get('correct_answer', '')}\" Loại lỗi={item.get('error_type')}"
            )
            for item in wrong
        )
        prompt = f"""Viết mô tả ngắn gọn (1 câu tiếng Việt) cho từng lỗi sai:
{summary}

JSON: [{{"question_id":"1","error_detail":"mô tả lỗi cụ thể"}}]
CHỈ JSON."""

        try:
            response = OllamaService.generate(prompt, temperature=0.1)
            details = self._safe_parse_json_array(response)
            detail_map = {
                str(item.get("question_id")): str(item.get("error_detail") or "").strip()
                for item in details
                if isinstance(item, dict)
            }

            for result in results:
                if result.get("is_correct"):
                    continue
                qid = str(result.get("question_id") or "")
                detail = detail_map.get(qid)
                if detail:
                    result["error_detail"] = detail
                elif not result.get("error_detail"):
                    result["error_detail"] = self._generate_rule_based_detail(result)
        except Exception as exc:
            logger.warning("LLM enrich errors failed (using rule-based): %s", exc)
            for result in results:
                if not result.get("is_correct") and not result.get("error_detail"):
                    result["error_detail"] = self._generate_rule_based_detail(result)

        return results

    def _safe_parse_json_array(self, response: str) -> List[Dict[str, Any]]:
        """Parse JSON array from LLM output and attempt minimal repairs."""
        clean = re.sub(r"<think>.*?</think>", "", response or "", flags=re.DOTALL | re.IGNORECASE)
        clean = re.sub(r"```json|```", "", clean).strip()

        array_match = re.search(r"\[.*\]", clean, flags=re.DOTALL)
        if array_match:
            clean = array_match.group(0)

        try:
            parsed = json.loads(clean)
            if isinstance(parsed, list):
                return parsed
            if isinstance(parsed, dict):
                return [parsed]
            return []
        except json.JSONDecodeError:
            repaired = re.sub(r",\s*([}\]])", r"\1", clean)
            if repaired and not repaired.endswith("]") and repaired.startswith("["):
                repaired = repaired + "]"

            try:
                parsed = json.loads(repaired)
                if isinstance(parsed, list):
                    return parsed
                if isinstance(parsed, dict):
                    return [parsed]
                return []
            except json.JSONDecodeError:
                logger.error("JSON parse failed even after repair: %s", repaired[:200])
                return []

    def _compare_answers(self, student: str, expected: Dict[str, Any]) -> Dict[str, Any]:
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
                "error_hint": None if is_correct else self._detect_error_hint(student, correct, answer_type),
            }

        if answer_type == "boolean":
            student_bool = self._parse_boolean(student)
            correct_bool = self._parse_boolean(correct)
            is_correct = student_bool is not None and correct_bool is not None and student_bool == correct_bool
            return {
                "is_correct": is_correct,
                "matched_items": 1 if is_correct else 0,
                "total_items": 1,
                "error_hint": None if is_correct else self._detect_error_hint(student, correct, answer_type),
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
                    "error_hint": self._detect_error_hint(student, correct, answer_type),
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
                        "error_hint": None if is_correct else self._detect_error_hint(student, correct, answer_type),
                    }

                return {
                    "is_correct": is_correct,
                    "matched_items": total if is_correct else 0,
                    "total_items": total,
                    "error_hint": None if is_correct else self._detect_error_hint(student, correct, answer_type),
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
                    "error_hint": None if is_correct else self._detect_error_hint(student, correct, answer_type),
                }

            return {
                "is_correct": is_correct,
                "matched_items": total if is_correct else 0,
                "total_items": total,
                "error_hint": None if is_correct else self._detect_error_hint(student, correct, answer_type),
            }

        # Legacy/default text compare
        normalized_student = self._normalize_text(student)
        normalized_correct = self._normalize_text(correct)

        if normalized_student == normalized_correct:
            return {"is_correct": True, "matched_items": 1, "total_items": 1, "error_hint": None}

        # Backward-compatible number fallback for values like "5 qua" vs "5"
        correct_number = self._extract_number(correct)
        student_number = self._extract_number(student)
        if correct_number is not None and student_number is not None and abs(student_number - correct_number) < 1e-9:
            return {"is_correct": True, "matched_items": 1, "total_items": 1, "error_hint": None}

        return {
            "is_correct": False,
            "matched_items": 0,
            "total_items": 1,
            "error_hint": self._detect_error_hint(student, correct, answer_type),
        }

    def _detect_error_hint(self, student_ans: str, correct_ans: Any, answer_type: str) -> str:
        student_text = str(student_ans or "").strip()
        if not student_text:
            return "bo_sot_cau"

        student_num = self._extract_number(student_text)
        correct_num = self._extract_number(correct_ans)

        if student_num is not None and correct_num is not None:
            if abs(student_num - correct_num) < 1e-9:
                unit_keywords = ["cm", "m", "km", "kg", "g", "l", "ml", "quả", "con", "cái", "bạn", "người"]
                correct_str = str(correct_ans or "").lower()
                has_unit_in_correct = any(unit in correct_str for unit in unit_keywords)
                has_unit_in_student = any(unit in student_text.lower() for unit in unit_keywords)
                if has_unit_in_correct and not has_unit_in_student:
                    return "thieu_don_vi"
                return "khac"

            diff = abs(student_num - correct_num)
            if diff == 1:
                return "tinh_sai"

            student_digits = str(int(abs(student_num))) if float(student_num).is_integer() else ""
            correct_digits = str(int(abs(correct_num))) if float(correct_num).is_integer() else ""
            if student_digits and correct_digits and len(student_digits) == len(correct_digits):
                if student_digits[::-1] == correct_digits:
                    return "viet_sai_so"

            if answer_type in {"number", "text"} and diff >= 2:
                return "tinh_sai"

        unit_keywords = ["cm", "m", "km", "kg", "g", "l", "ml", "quả", "con", "cái", "bạn", "người"]
        correct_str = str(correct_ans or "").lower()
        has_unit_in_correct = any(unit in correct_str for unit in unit_keywords)
        has_unit_in_student = any(unit in student_text.lower() for unit in unit_keywords)
        if has_unit_in_correct and not has_unit_in_student and student_num is not None:
            return "thieu_don_vi"

        if answer_type in {"ordered_list", "unordered_list", "multi_blank"}:
            return "sai_loi_giai"

        return "khac"

    def _verify_correctness(self, student: str, correct: str) -> Optional[bool]:
        """
        Double-check correctness with deterministic rules.
        Return None when confidence is low and should not override LLM.
        """
        student_num = self._extract_number(student)
        correct_num = self._extract_number(correct)
        if student_num is not None and correct_num is not None:
            return abs(student_num - correct_num) < 1e-9

        if len(student or "") < 50 and len(correct or "") < 50:
            if self._normalize_text(student) == self._normalize_text(correct):
                return True

        return None

    def _generate_rule_based_detail(self, result: Dict[str, Any]) -> str:
        error_type = self._normalize_error_type(result.get("error_type"))
        student = str(result.get("student_answer") or "").strip() or "(trống)"
        correct = str(result.get("correct_answer") or "").strip() or "(không rõ)"

        templates = {
            "tinh_sai": f"Học sinh trả lời {student}, đáp án đúng là {correct}.",
            "nham_phep_tinh": f"Học sinh có thể nhầm phép tính. Trả lời {student} thay vì {correct}.",
            "thieu_don_vi": f"Thiếu đơn vị. Học sinh viết \"{student}\", cần viết \"{correct}\".",
            "viet_sai_so": f"Viết nhầm số. Học sinh viết {student}, đáp án là {correct}.",
            "bo_sot_cau": "Học sinh bỏ sót câu này.",
            "sai_loi_giai": f"Cách làm chưa đúng. Học sinh trả lời {student}, đáp án {correct}.",
            "doc_de_sai": f"Có thể hiểu sai đề. Học sinh trả lời {student}, đáp án đúng {correct}.",
            "khac": f"Học sinh trả lời {student}, đáp án đúng là {correct}.",
        }
        return templates.get(error_type, templates["khac"])

    def _normalize_error_type(self, value: Any) -> str:
        normalized = self._normalize_text(value).replace(" ", "_")
        return normalized if normalized in ALLOWED_ERROR_TYPES else "khac"

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
- Value là object gồm question_text và answer.
- Nếu không tìm thấy, để trống "".

Ví dụ JSON:
{{
  "1": {{"question_text": "5 + 3 = ?", "answer": "8"}},
  "2": {{"question_text": "12 - 7 = ?", "answer": "4"}}
}}

CHỈ TRẢ VỀ JSON."""
        
        try:
            response = OllamaService.generate(prompt, temperature=0.1)
            clean = re.sub(r"<think>.*?</think>", "", response, flags=re.DOTALL | re.IGNORECASE)
            clean = re.sub(r"```json|```", "", clean).strip()

            parsed = json.loads(clean)
            if isinstance(parsed, dict):
                normalized: Dict[str, Any] = {}
                for key, value in parsed.items():
                    if isinstance(value, dict):
                        normalized[str(key)] = {
                            "question_text": str(value.get("question_text") or "").strip(),
                            "answer": str(value.get("answer") or "").strip(),
                        }
                    else:
                        normalized[str(key)] = {
                            "question_text": "",
                            "answer": str(value or "").strip(),
                        }
                return normalized

            if isinstance(parsed, list):
                normalized = {}
                for item in parsed:
                    if not isinstance(item, dict):
                        continue
                    qid = str(item.get("question_id") or item.get("id") or "").strip()
                    if not qid:
                        continue
                    normalized[qid] = {
                        "question_text": str(item.get("question_text") or item.get("question") or "").strip(),
                        "answer": str(item.get("student_answer") or item.get("answer") or "").strip(),
                    }
                return normalized

            return {}
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
