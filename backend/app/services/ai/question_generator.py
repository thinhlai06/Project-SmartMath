"""
Question Generator - Generates CPA-style math questions using RAG + Qwen2.5.
"""
import json
import logging
import re
from typing import Dict, List
from .lmstudio_service import LMStudioService
from .rag_service import RAGService

logger = logging.getLogger(__name__)


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
            system = "Bạn là AI giáo viên Toán tiểu học Việt Nam. Bắt buộc bám sát ngữ cảnh SGK được cung cấp và chỉ trả về JSON array hợp lệ."

            logger.info("[AI] Generating %d %s questions...", count, level)
            response = LMStudioService.generate(prompt, system=system, temperature=0.2)
            questions = self._parse_json(response)
            result[level] = questions

        return result

    def generate_differentiation_questions(
        self,
        topic: str,
        grade: int,
        objective: str,
        tiers: List[str] = None
    ) -> Dict:
        """Generate differentiated questions with RAG context."""
        if not tiers:
            tiers = ["foundation", "standard", "extension", "advanced"]

        # Retrieve SGK context
        rag_results = self.rag.retrieve(f"{topic} {objective}", grade=grade, k=4)
        rag_context = "\n".join([d.page_content[:500] for d in rag_results])
        rag_sources = list(set([d.metadata.get('source_file', '') for d in rag_results]))

        result = {"content": {}, "rag_sources": rag_sources}

        for tier in tiers:
            # Generate 2 questions per tier for now
            count = 2
            prompt = self._build_differentiation_prompt(tier, topic, grade, objective, count, rag_context)
            system = "Bạn là AI giáo viên Toán tiểu học Việt Nam. Bắt buộc bám sát ngữ cảnh SGK được cung cấp và chỉ trả về JSON array hợp lệ."
            
            logger.info("[AI] Generating %d %s questions...", count, tier)
            response = LMStudioService.generate(prompt, system=system, temperature=0.2)
            questions = self._parse_json(response)
            result["content"][tier] = questions

        return result

    def _build_differentiation_prompt(
        self,
        tier: str,
        topic: str,
        grade: int,
        objective: str,
        count: int,
        context: str,
    ) -> str:
        tier_label = {
            "foundation": "Nhận biết",
            "standard": "Thông hiểu",
            "extension": "Vận dụng",
            "advanced": "Vận dụng cao",
        }.get(tier, tier)

        grade_rule_map = {
            1: {
                "limit": "Chỉ 1 bước, số nhỏ, không suy luận phức tạp.",
                "forbidden": "Không nhân/chia, không phân số/thập phân/phần trăm, không câu đố mẹo.",
                "tiers": {
                    "foundation": {
                        "must": "Phép tính trực tiếp hoặc nhận dạng số, cực cơ bản.",
                        "language": "Dùng từ: tính, điền số, số nào, bao nhiêu.",
                    },
                    "standard": {
                        "must": "Bài toán lời văn rất ngắn (1 câu) với thêm/bớt/còn lại.",
                        "language": "Dùng từ: có, thêm, bớt, còn, tất cả, cho thêm, lấy đi.",
                    },
                    "extension": {
                        "must": "Tình huống quen thuộc (kẹo, bút, bạn bè), học sinh tự chọn phép tính.",
                        "language": "Dùng từ: trong hộp, trên bàn, của bạn, nhiều hơn, ít hơn.",
                    },
                    "advanced": {
                        "must": "Tìm số chưa biết đơn giản hoặc suy luận nhẹ, vẫn không quá 1 bước.",
                        "language": "Dùng từ: lúc đầu, sau đó, còn lại, hỏi ban đầu có bao nhiêu.",
                    },
                },
            },
            2: {
                "limit": "Có thể 1-2 bước nhẹ, số 2 chữ số, có thể dùng nhân/chia cơ bản.",
                "forbidden": "Không kiến thức lớp trên, không câu dài rối, không đánh đố.",
                "tiers": {
                    "foundation": {
                        "must": "Tính toán trực tiếp.",
                        "language": "Dùng từ: tính, đặt tính, kết quả.",
                    },
                    "standard": {
                        "must": "Hiểu khi nào dùng +, -, x, : trong ngữ cảnh đơn giản.",
                        "language": "Dùng từ: mỗi, chia đều, gấp, tất cả, mỗi nhóm, mỗi bạn.",
                    },
                    "extension": {
                        "must": "Bài toán thực tế, có thể 2 bước nhẹ, có chọn phép tính.",
                        "language": "Dùng từ: cửa hàng, mua, bán, còn lại, tổng cộng, sau khi, rồi.",
                    },
                    "advanced": {
                        "must": "Bài toán 2 bước có suy luận hoặc tìm ngược, không đánh đố.",
                        "language": "Dùng từ: ban đầu, sau đó, biết rằng, hỏi lúc đầu.",
                    },
                },
            },
            3: {
                "limit": "2-3 bước, số lớn hơn, logic rõ ràng.",
                "forbidden": "Không vượt kiến thức lớp 3, không bối cảnh phức tạp.",
                "tiers": {
                    "foundation": {
                        "must": "Tính toán trực tiếp (nhân/chia/cộng/trừ).",
                        "language": "Dùng từ: tính, tìm kết quả.",
                    },
                    "standard": {
                        "must": "Hiểu bản chất bài toán, có thể có lời văn vừa phải.",
                        "language": "Dùng từ: gấp, giảm, nhiều hơn, ít hơn, bằng.",
                    },
                    "extension": {
                        "must": "Bài toán thực tế 2-3 bước, có kế hoạch giải rõ ràng.",
                        "language": "Dùng từ: tổng cộng, còn lại, mỗi, chia đều, sau khi, tiếp tục.",
                    },
                    "advanced": {
                        "must": "Bài nhiều bước có suy luận, có thể có dữ kiện gián tiếp.",
                        "language": "Dùng từ: hơn kém, gấp ... lần, biết rằng, nếu ... thì, tìm số ban đầu.",
                    },
                },
            },
        }

        grade_cfg = grade_rule_map.get(grade, grade_rule_map[1])
        tier_cfg = grade_cfg["tiers"].get(tier, grade_cfg["tiers"]["foundation"])

        rag_context = (context or "").strip()
        if not rag_context:
            rag_context = "Không có ngữ cảnh SGK cụ thể. Chỉ sinh bài cơ bản, đúng chuẩn lớp, không mở rộng nội dung."

        return f"""SYSTEM RULE: SINH BAI TOAN PHAN HOA CHO LOP 1-3

MUC TIEU:
- Tao dung {count} cau hoi cho mon Toan tieu hoc.
- Chu de: {topic}
- Muc tieu bai hoc: {objective}
- Lop: {grade}
- Muc do tu duy: {tier_label}

NGUYEN TAC BAT BUOC:
1) Dung trinh do lop.
2) Dung muc do tu duy.
3) Khong vuot chuong trinh.

RANG BUOC RIENG CHO LOP {grade}:
- Gioi han: {grade_cfg['limit']}
- Cam: {grade_cfg['forbidden']}

RANG BUOC RIENG CHO MUC DO {tier_label}:
- Bat buoc sinh: {tier_cfg['must']}
- Ngu ngon uu tien: {tier_cfg['language']}

QUY TAC NGON NGU BAT BUOC:
- Cau ngan, de hieu, toi da 2 dong/cau hoi.
- Ngu canh doi thuong: lop hoc, gia dinh, cua hang.
- Tu vung than quen: keo, but, sach, qua, ban, hoc sinh.
- KHONG dung tu kho: "gia su", "suy ra", "chung minh".
- KHONG dung cau dai nhieu menh de.

NGU CANH SGK (BAT BUOC BAM SAT):
{rag_context[:1600]}

DINH DANG DAU RA BAT BUOC:
- Chi tra ve JSON array hop le.
- Moi phan tu gom dung 3 truong: question, answer, hint.
- Khong markdown, khong giai thich ngoai JSON.

Mau:
[
  {{"question": "...", "answer": "...", "hint": "..."}}
]

Tu kiem tra truoc khi tra ve:
- Dung {count} cau.
- Dung lop {grade}.
- Dung muc do {tier_label}.
- Khong vuot chuong trinh.
- JSON parse duoc.
"""

    def _build_prompt(self, level: str, topic: str, grade: int, objective: str, count: int, context: str) -> str:
        level_desc = {
            "concrete": "CỤ THỂ (Concrete): Bắt buộc là bài toán đố thực tế. Dùng đồ vật gần gũi như: quả táo, viên bi, cái kẹo, cái bút, chiếc lá. KHÔNG được chỉ đưa ra phép tính trần trụi.",
            "pictorial": "HÌNH ẢNH (Pictorial): Dùng sơ đồ, hình vẽ. Ví dụ: 'Nhìn vào sơ đồ đoạn thẳng sau...' hoặc 'Biểu diễn bằng hình vẽ...'",
            "abstract": "TRỪU TƯỢNG (Abstract): Chỉ ra phép tính trần trụi bằng số và dấu. Ví dụ: 'Tính: 45 + 37'.",
            "foundation": "NHẬN BIẾT - Bài tập cơ bản, dễ nhất, nhận diện và áp dụng trực tiếp SGK.",
            "standard": "THÔNG HIỂU - Bài tập trung bình, đòi hỏi 1 bước suy luận đơn giản.",
            "extension": "VẬN DỤNG - Bài tập khó hơn, cần 2 bước tính toán hoặc đòi hỏi tư duy phân tích.",
            "advanced": "VẬN DỤNG CAO - Bài tập cực khó, tư duy nâng cao, dành cho học sinh giỏi."
        }
        desc = level_desc.get(level, level.upper())

        # Extract math operator constraints from the topic
        topic_lower = topic.lower()
        operator_rule = "Sinh phép tính phù hợp với chủ đề."
        if "cộng" in topic_lower or "tổng" in topic_lower or "thêm" in topic_lower:
            operator_rule = "TUYỆT ĐỐI CHỈ DÙNG PHÉP CỘNG. KHÔNG được sử dụng phép trừ, nhân, chia."
        elif "trừ" in topic_lower or "hiệu" in topic_lower or "bớt" in topic_lower:
            operator_rule = "TUYỆT ĐỐI CHỈ DÙNG PHÉP TRỪ. KHÔNG được sử dụng phép cộng, nhân, chia."
        elif "nhân" in topic_lower or "tích" in topic_lower or "gấp" in topic_lower:
            operator_rule = "TUYỆT ĐỐI CHỈ DÙNG PHÉP NHÂN."
        elif "chia" in topic_lower or "thương" in topic_lower or "giảm" in topic_lower:
            operator_rule = "TUYỆT ĐỐI CHỈ DÙNG PHÉP CHIA."

        grade_rules = {
            1: (
                "Giới hạn: Ưu tiên cộng/trừ trong phạm vi 10, 20 hoặc 100 tùy theo Chủ đề. Số tối đa là 100.",
                "CẤM NGẶT: TUYỆT ĐỐI CẤM SỬ DỤNG phân số, phần trăm (%), số thập phân. Cấm phép nhân/chia, cấm bài toán nhiều hơn 1 bước tính. Câu văn cực kỳ ngắn gọn."
            ),
            2: (
                "Giới hạn: Cộng/trừ có nhớ hoặc không nhớ trong phạm vi 1000. Phép nhân/chia cơ bản (bảng 2-5).",
                "CẤM NGẶT: TUYỆT ĐỐI CẤM SỬ DỤNG phân số, phần trăm (%), số thập phân. Cấm các phép tính phức tạp ngoài SGK Lớp 2."
            ),
            3: (
                "Giới hạn: Cộng/trừ trong phạm vi 10.000, 100.000. Nhân số có 1-2 chữ số. Chia số có 1 chữ số.",
                "CẤM NGẶT: TUYỆT ĐỐI CẤM SỬ DỤNG phân số, phần trăm (%), số thập phân. Cấm hình học cấp 2."
            ),
        }
        positive_rule, negative_rule = grade_rules.get(
            grade,
            (
                "Chỉ tạo bài toán khối Tiểu học phù hợp độ tuổi.",
                "CẤM NGẶT: TUYỆT ĐỐI CẤM SỬ DỤNG phân số, phần trăm (%), số thập phân. KHÔNG sử dụng nội dung THCS.",
            ),
        )

        rag_context = (context or "").strip()
        if not rag_context:
            rag_context = "Không tìm thấy ngữ cảnh SGK cụ thể. Tự động sinh dựa trên kiến thức chuẩn Tiểu học Bộ GDĐT."

        # Template ví dụ động (Dynamic Few-shot Example) theo Khối lớp và Phép tính
        ex_num1, ex_num2 = (8, 3) if grade == 1 else ((45, 23) if grade == 2 else (150, 25))
        ex_obj = "quả táo" if grade == 1 else ("viên bi" if grade == 2 else "quyển vở")
        
        ex_op = "+"
        if "trừ" in topic_lower or "hiệu" in topic_lower or "bớt" in topic_lower:
            ex_op = "-"
        elif "nhân" in topic_lower or "tích" in topic_lower or "gấp" in topic_lower:
            ex_op = "x"
        elif "chia" in topic_lower or "thương" in topic_lower or "giảm" in topic_lower:
            ex_op = ":"

        # Logic tính ví dụ
        if ex_op == "+":
            ex_q = f"Lan có {ex_num1} {ex_obj}, mẹ mua thêm {ex_num2} {ex_obj}. Hỏi Lan có tất cả bao nhiêu {ex_obj}?"
            ex_a = f"{ex_num1} + {ex_num2} = {ex_num1 + ex_num2} ({ex_obj})"
            ex_h = f"Thực hiện phép tính cộng giữa số {ex_obj} ban đầu và số được mua thêm."
        elif ex_op == "-":
            ex_q = f"Lan có {ex_num1} {ex_obj}, Lan cho bạn {ex_num2} {ex_obj}. Hỏi Lan còn lại bao nhiêu {ex_obj}?"
            ex_a = f"{ex_num1} - {ex_num2} = {ex_num1 - ex_num2} ({ex_obj})"
            ex_h = f"Thực hiện phép tính trừ để tìm số {ex_obj} còn lại."
        elif ex_op == "x":
            ex_q = f"Mỗi hộp có {ex_num2} {ex_obj}. Hỏi {ex_num1} hộp như thế có tất cả bao nhiêu {ex_obj}?"
            ex_a = f"{ex_num1} x {ex_num2} = {ex_num1 * ex_num2} ({ex_obj})"
            ex_h = f"Sử dụng phép nhân để tính tổng số {ex_obj}."
        else: # chia
            safe_num2 = ex_num2 if ex_num2 != 0 else 1
            ex_q = f"Có {ex_num1} {ex_obj} chia đều vào {safe_num2} hộp. Hỏi mỗi hộp có bao nhiêu {ex_obj}?"
            ex_a = f"{ex_num1} : {safe_num2} = {ex_num1 // safe_num2} ({ex_obj})"
            ex_h = f"Sử dụng phép chia để tìm số {ex_obj} trong mỗi hộp."

        if "abstract" in level or "foundation" in level:
            # Nhận biết / Trừu tượng chỉ cần phép tính
            ex_q = f"Tính: {ex_num1} {ex_op} {ex_num2} = ?"
            ex_a = f"{ex_num1 + ex_num2 if ex_op == '+' else (ex_num1 - ex_num2 if ex_op == '-' else (ex_num1 * ex_num2 if ex_op == 'x' else ex_num1 // (ex_num2 if ex_num2!=0 else 1)))}"
            ex_h = f"Thực hiện phép tính {ex_op}."

        example = f'[{{"question": "{ex_q}", "answer": "{ex_a}", "hint": "{ex_h}"}}]'

        return f"""Bạn là Giáo viên Toán Tiểu học Việt Nam xuất sắc. Nhiệm vụ của bạn là VIẾT ĐỀ BÀI TẬP trực tiếp, KHÔNG đưa ra hướng dẫn hay mô tả.

HÃY ĐÓNG VAI LÀ NGƯỜI RA ĐỀ, viết thẳng nội dung {count} câu hỏi dưới dạng JSON.
- Cấp lớp: Lớp {grade}.
- Dạng bài: {desc}.
- Chủ đề: {topic}. Mục tiêu: {objective}.

Quy tắc Bắt buộc:
- {operator_rule}
- {positive_rule}
- {negative_rule}
- KHÔNG chen chữ ngoài JSON. KHÔNG nói "Đây là câu hỏi...". Chỉ trả về duy nhất 1 array JSON.

Nội dung tham khảo (Bắt chước phong cách này):
{rag_context[:1000]}

MẪU VÍ DỤ PHẢI HỌC THEO VỀ MẶT CẤU TRÚC JSON (Ví dụ này là bài mô phỏng, hãy tự tạo bài mới của bạn):
```json
{example}
```

Hãy trích xuất / sinh ra đúng {count} câu hỏi theo MẪU VÍ DỤ trên:
"""

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
