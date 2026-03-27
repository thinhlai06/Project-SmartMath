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
        """Generate CPA worksheet questions with RAG patterns from SGK."""
        if counts is None:
            counts = {"concrete": 3, "pictorial": 3, "abstract": 3}

        # Retrieve SGK context
        rag_results = self.rag.retrieve(f"{topic} {objective}", grade=grade, k=5)
        
        # Format RAG context as clear reference patterns (synchronized with differentiation)
        rag_patterns = []
        for i, doc in enumerate(rag_results, 1):
            content = doc.page_content.strip()
            source = doc.metadata.get('source_file', 'SGK')
            rag_patterns.append(f"Mẫu {i} (Nguồn: {source}):\n{content}")
        
        rag_context = "\n\n".join(rag_patterns)
        rag_sources = list(set([d.metadata.get('source_file', '') for d in rag_results]))

        result = {"concrete": [], "pictorial": [], "abstract": [], "rag_sources": rag_sources}

        for level in ["concrete", "pictorial", "abstract"]:
            count = counts.get(level, 3)
            if count == 0:
                continue

            prompt = self._build_prompt(level, topic, grade, objective, count, rag_context)
            system = (
                "Bạn là chuyên gia giáo dục Toán tiểu học Việt Nam. "
                "Nhiệm vụ của bạn là dựa trên cấu trúc các MẪU BÀI TẬP SGK để sinh bài mới "
                "đáp ứng đúng tiêu chuẩn CPA (Cụ thể - Hình ảnh - Trừu tượng). Chỉ trả về JSON array."
            )

            logger.info("[AI] Generating %d %s questions (CPA Sync)...", count, level)
            response = LMStudioService.generate(prompt, system=system, temperature=0.3)
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
        """Generate differentiated questions with RAG context used as structural patterns."""
        if not tiers:
            tiers = ["foundation", "standard", "extension", "advanced"]

        # Retrieve SGK context
        rag_results = self.rag.retrieve(f"{topic} {objective}", grade=grade, k=5)
        
        # Format RAG context as clear reference patterns
        rag_patterns = []
        for i, doc in enumerate(rag_results, 1):
            content = doc.page_content.strip()
            source = doc.metadata.get('source_file', 'SGK')
            rag_patterns.append(f"Mẫu {i} (Nguồn: {source}):\n{content}")
        
        rag_context = "\n\n".join(rag_patterns)
        rag_sources = list(set([d.metadata.get('source_file', '') for d in rag_results]))

        result = {"content": {}, "rag_sources": rag_sources}

        for tier in tiers:
            # Generate 2 questions per tier
            count = 2
            prompt = self._build_differentiation_prompt(tier, topic, grade, objective, count, rag_context)
            system = (
                "Bạn là chuyên gia giáo dục Toán tiểu học Việt Nam. "
                "Nhiệm vụ của bạn là dựa trên các MẪU BÀI TẬP SGK được cung cấp để sinh bài tập mới "
                "theo đúng phong cách, từ vựng và độ khó yêu cầu. Chỉ trả về JSON array."
            )
            
            logger.info("[AI] Generating %d %s questions (Refined RAG)...", count, tier)
            response = LMStudioService.generate(prompt, system=system, temperature=0.3)
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
                "limit": "Số trong phạm vi 10, 20 hoặc 100 (tùy bài). Không quá 1 bước tính.",
                "forbidden": "Không nhân/chia, không phân số, không số thập phân.",
                "tiers": {
                    "foundation": {
                        "must": "Nhìn hình đếm số hoặc phép tính cộng/trừ 1 bước cực đơn giản.",
                        "transformation": "Dùng ngữ cảnh bài mẫu nhưng đơn giản hóa tối đa câu chữ.",
                    },
                    "standard": {
                        "must": "Bài toán lời văn 1 bước (thêm/bớt/tất cả).",
                        "transformation": "Giữ nguyên độ khó bài mẫu, chỉ thay đổi số và đối tượng (VD: táo -> cam).",
                    },
                    "extension": {
                        "must": "Bài toán yêu cầu suy luận nhẹ (nhiều hơn/ít hơn).",
                        "transformation": "Dựa trên bài mẫu, thêm một dữ kiện so sánh (nhiều hơn/ít hơn).",
                    },
                    "advanced": {
                        "must": "Bài toán tìm số chưa biết hoặc logic đơn giản.",
                        "transformation": "Đảo ngược câu hỏi của bài mẫu (VD: cho biết tổng và 1 số, tìm số còn lại).",
                    },
                },
            },
            2: {
                "limit": "Phạm vi 1000. Phép nhân/chia bảng 2-5. Có thể 2 bước tính.",
                "forbidden": "Không phân số, không số thập phân, không kiến thức lớp 3.",
                "tiers": {
                    "foundation": {
                        "must": "Tính nhẩm hoặc đặt tính rồi tính trực tiếp.",
                        "transformation": "Lấy phép tính lõi từ bài mẫu, bỏ phần lời văn phức tạp.",
                    },
                    "standard": {
                        "must": "Bài toán lời văn 1-2 bước quen thuộc.",
                        "transformation": "Tạo bài tương đương hoàn toàn với bài mẫu về cấu trúc.",
                    },
                    "extension": {
                        "must": "Bài toán kết hợp cộng/trừ và nhân/chia cơ bản.",
                        "transformation": "Kết hợp hai ý từ các bài mẫu khác nhau thành một bài toán 2 bước.",
                    },
                    "advanced": {
                        "must": "Bài toán giải bằng 2 bước có suy luận gián tiếp.",
                        "transformation": "Phát triển bài mẫu thành tình huống thực tế phức tạp hơn (VD: mua sắm có thối tiền).",
                    },
                },
            },
            3: {
                "limit": "Phạm vi 100.000. Nhân/chia số có nhiều chữ số. 2-3 bước tính.",
                "forbidden": "Không số thập phân, không hình học THCS.",
                "tiers": {
                    "foundation": {
                        "must": "Thực hiện phép tính cơ bản hoặc nhận diện hình học/đơn vị đo.",
                        "transformation": "Rút gọn bài mẫu thành dạng kiểm tra kiến thức nền tảng.",
                    },
                    "standard": {
                        "must": "Giải bài toán có lời văn 2 bước tính.",
                        "transformation": "Tạo bài mới cùng dạng bài mẫu (VD: rút về đơn vị, tính chu vi).",
                    },
                    "extension": {
                        "must": "Bài toán tổng hợp 2-3 bước, có dữ kiện cần xử lý trước.",
                        "transformation": "Tăng độ phức tạp của bài mẫu bằng cách thêm đơn vị đo khác nhau cần đổi.",
                    },
                    "advanced": {
                        "must": "Bài toán tư duy, tìm quy luật hoặc giải toán bằng cách lập luận.",
                        "transformation": "Biến bài mẫu thành bài toán thử thách, yêu cầu lập luận logic chặt chẽ.",
                    },
                },
            },
        }

        grade_cfg = grade_rule_map.get(grade, grade_rule_map[1])
        tier_cfg = grade_cfg["tiers"].get(tier, grade_cfg["tiers"]["foundation"])

        rag_context = (context or "").strip()
        if not rag_context or "Không tìm thấy" in rag_context:
            rag_context = "Dùng kiến thức chuẩn SGK lớp %s. Sinh bài cơ bản, mẫu mực." % grade

        return f"""NHIỆM VỤ: Sinh {count} bài toán phân hóa mức độ "{tier_label}" cho Lớp {grade}.

CHỦ ĐỀ: {topic}
MỤC TIÊU: {objective}

DANH SÁCH MẪU BÀI TẬP TỪ SGK (DÙNG LÀM KHUÔN MẪU):
{rag_context}

YÊU CẦU PHÂN HÓA MỨC ĐỘ "{tier_label}":
- Đặc điểm: {tier_cfg['must']}
- Cách biến đổi từ mẫu SGK: {tier_cfg['transformation']}

QUY TẮC NGÔN NGỮ & KIẾN THỨC (LỚP {grade}):
- Giới hạn: {grade_cfg['limit']}
- Cấm: {grade_cfg['forbidden']}
- Văn phong: Giống hệt sách giáo khoa (ngắn gọn, trong sáng, dùng từ gần gũi: kẹo, bi, bạn Lan, nhà em...).
- Tuyệt đối không dùng từ Hán Việt khó hiểu hoặc cách đặt câu phức tạp.

ĐỊNH DẠNG ĐẦU RA:
- Trả về JSON array: [{{"question": "...", "answer": "...", "hint": "..."}}]
- Không kèm bất kỳ lời giải thích nào ngoài JSON.

HƯỚNG DẪN SINH BÀI:
Hãy chọn một cấu trúc bài trong phần "DANH SÁCH MẪU" rồi thực hiện "Cách biến đổi" để tạo ra bài mới cho mức độ {tier_label}. Đảm bảo bài sinh ra tự nhiên như trong sách bài tập.
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
        if not rag_context or "Không tìm thấy" in rag_context:
            rag_context = "Dùng kiến thức chuẩn SGK lớp %s. Tự động sinh dựa trên kiến thức chuẩn Tiểu học Bộ GDĐT." % grade

        # Template ví dụ động (Dynamic Few-shot Example) theo Khối lớp và Phép tính
        topic_lower = topic.lower()
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

        return f"""NHIỆM VỤ: Sinh {count} bài toán dạng {desc} cho Lớp {grade}.

CHỦ ĐỀ: {topic}
MỤC TIÊU: {objective}

DANH SÁCH MẪU BÀI TẬP TỪ SGK (DÙNG ĐỂ HỌC TẬP CẤU TRÚC):
{rag_context}

TIÊU CHUẨN CPA RIÊNG CHO BÀI NÀY:
- {desc}

QUY TẮC BẮT BUỘC:
- {operator_rule}
- {positive_rule}
- {negative_rule}
- Văn phong: Ngắn gọn, trong sáng, đúng kiểu SGK Việt Nam. Không giải thích bên ngoài JSON.

MẪU VÍ DỤ PHẢI HỌC THEO VỀ MẶT CẤU TRÚC JSON:
```json
{example}
```

HƯỚNG DẪN SINH:
Dựa trên phong cách ngôn ngữ và bối cảnh (context) từ DANH SÁCH MẪU SGK bên trên, hãy tạo ra {count} bài mới phù hợp với mục tiêu {objective} và tiêu chuẩn {desc}. 
Đảm bảo bài toán tự nhiên, gần gũi như trong sách giáo khoa Lớp {grade}.

ĐỊNH DẠNG ĐẦU RA:
JSON array duy nhất: [{{"question": "...", "answer": "...", "hint": "..."}}]
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
