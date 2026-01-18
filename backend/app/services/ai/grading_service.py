import logging
import json
import re
from typing import List, Dict, Any
from .ocr_service import OCRService
from .ollama_service import OllamaService

logger = logging.getLogger(__name__)

class GradingService:
    def __init__(self):
        self.ocr = OCRService()

    def grade_submission(self, image_content: bytes, correct_answers: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Grade a student submission image.
        If correct_answers is provided, compares against it.
        If correct_answers is None/Empty, uses AI to self-solve and grade.
        """
        # 1. OCR Extraction
        try:
            raw_text = self.ocr.recognize(image_content)
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
                
                # Simple Comparison Logic (can be enhanced)
                is_correct = self._compare_answers(student_ans, str(expected['answer']))
                
                # Default 10 points per question if not specified
                points = expected.get('points', 10)
                score = points if is_correct else 0
                
                results.append({
                    "question_id": str(q_id),
                    "student_answer": student_ans,
                    "correct_answer": expected['answer'],
                    "is_correct": is_correct,
                    "score": score,
                    "max_score": points
                })
                total_score += score
                total_max_score += points

            return {
                "total_score": total_score,
                "max_score": total_max_score,
                "results": results,
                "raw_text": raw_text,
                "extracted_json": extracted_answers
            }
        else:
            # Auto-Solve Path
            return self._grade_without_key(raw_text)

    def _grade_without_key(self, text: str) -> Dict[str, Any]:
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
            
            total_score = sum(item.get('score', 0) for item in results)
            total_max_score = sum(item.get('max_score', 10) for item in results)
            
            return {
                "total_score": total_score,
                "max_score": total_max_score,
                "results": results,
                "raw_text": text,
                "extracted_json": {str(r['question_id']): r['student_answer'] for r in results}
            }
        except Exception as e:
            logger.error(f"Auto-grading failed: {e}")
            return {
                "error": "Failed to auto-grade", 
                "details": str(e),
                "raw_text": text
            }

    def _compare_answers(self, student: str, correct: str) -> bool:
        # Basic normalization: lowercase, remove spaces, remove dots/commas if number?
        s = student.lower().strip().replace(" ", "")
        c = correct.lower().strip().replace(" ", "")
        
        if s == c:
            return True
            
        # Optional: Fuzzy match or number parsing
        # e.g. "5 qua" vs "5"
        if c.isdigit():
            # Extract digits from student answer
            s_digits = "".join(filter(str.isdigit, s))
            return s_digits == c
            
        return False

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
