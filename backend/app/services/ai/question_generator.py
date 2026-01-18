"""
Question Generator - Generates CPA-style math questions using RAG + Qwen2.5.
"""
import json
import re
from typing import Dict, List
from .ollama_service import OllamaService
from .rag_service import RAGService


class QuestionGenerator:
    def __init__(self):
        self.rag = RAGService()

    def generate_cpa_questions(
        self,
        topic: str,
        grade: int,
        objective: str,
        counts: Dict[str, int] = None
    ) -> Dict:
        """Generate CPA worksheet questions with RAG context."""
        if counts is None:
            counts = {"concrete": 3, "pictorial": 3, "abstract": 3}

        # Retrieve SGK context
        rag_results = self.rag.retrieve(f"{topic} {objective}", grade=grade, k=4)
        rag_context = "\n".join([d.page_content[:500] for d in rag_results])
        rag_sources = list(set([d.metadata.get('source_file', '') for d in rag_results]))

        result = {"concrete": [], "pictorial": [], "abstract": [], "rag_sources": rag_sources}

        for level in ["concrete", "pictorial", "abstract"]:
            count = counts.get(level, 3)
            if count == 0:
                continue

            prompt = self._build_prompt(level, topic, grade, objective, count, rag_context)
            system = "Bạn là AI giáo viên Toán tiểu học Việt Nam. Trả lời bằng JSON array hợp lệ."

            print(f"🤖 Generating {count} {level} questions...")
            response = OllamaService.generate(prompt, system=system, temperature=0.7)
            questions = self._parse_json(response)
            result[level] = questions

        return result

    def _build_prompt(self, level: str, topic: str, grade: int, objective: str, count: int, context: str) -> str:
        level_desc = {
            "concrete": "CỤ THỂ - dùng đồ vật thực (kẹo, bi, táo)",
            "pictorial": "HÌNH ẢNH - dùng sơ đồ, hình vẽ",
            "abstract": "TRỪU TƯỢNG - dùng số và phép tính"
        }
        return f"""Tạo {count} câu hỏi Toán lớp {grade} theo phương pháp CPA.
Mức độ: {level.upper()} ({level_desc[level]})
Chủ đề: {topic}
Mục tiêu: {objective}

Tham khảo SGK:
{context[:2000]}

Trả về JSON array:
[{{"question": "...", "answer": "...", "hint": "..."}}]

CHỈ TRẢ VỀ JSON, KHÔNG TEXT KHÁC."""

    def _parse_json(self, text: str) -> List[Dict]:
        """Parse JSON from LLM response."""
        try:
            clean = re.sub(r"^```json?|```$", "", text.strip(), flags=re.MULTILINE).strip()
            return json.loads(clean)
        except:
            match = re.search(r'\[\s*\{.*\}\s*\]', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except:
                    pass
            return []
