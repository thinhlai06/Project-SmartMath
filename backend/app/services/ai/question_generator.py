"""
Question Generator - Generates CPA-style math questions using RAG + Qwen3.
"""
import json
import logging
import re
from typing import Dict, List, Optional
from .ollama_service import OllamaService
from .rag_service import RAGService

logger = logging.getLogger(__name__)

VOCABULARY_SUGGESTIONS = """
TỪ VỰNG TẠO BÀI TOÁN (Hãy chọn ngẫu nhiên để bài toán đa dạng, tự nhiên):
- Đồ vật: quả táo, cái kẹo, quyển vở, viên bi, đồ chơi, quả bóng, hộp sữa...
- Con vật: con chó, con mèo, con gà, con thỏ, con bò...
- Nhân vật: bạn An, bạn Bình, bạn Lan, bé Nam, mẹ, bố, cô giáo...
- Bối cảnh: trong lớp học, ở nhà, ngoài sân trường, trong cửa hàng...
- Hình học & Đo lường: hình vuông, hình tròn, tam giác, cạnh, góc, cm, kg, lít...
"""

TOPIC_RULES = {
    # Lớp 1
    "Phép cộng trong phạm vi 20": "[DÀNH CHO LỚP 1] Tuân thủ tư duy của học sinh Lớp 1 mới vào trường. Bắt buộc sinh tình huống: gộp lại, thêm vào, tất cả có bao nhiêu. Không được phép hỏi bớt đi.",
    "Phép trừ trong phạm vi 20": "[DÀNH CHO LỚP 1] Tuân thủ tư duy của Lớp 1. Bắt buộc sinh tình huống: bớt đi, cho đi, còn lại bao nhiêu, ít hơn.",
    "Hình học cơ bản": "[DÀNH CHO LỚP 1] Kiến thức rất cơ bản của Lớp 1. TUYỆT ĐỐI KHÔNG sinh bài đếm đồ vật hay tính toán. CHỈ yêu cầu nhận biết, phân biệt: hình vuông, hình tròn, tam giác trong đồ vật thực tế.",
    # Lớp 2
    "Bảng nhân 2, 5": "[DÀNH CHO LỚP 2] Phù hợp năng lực Lớp 2. Tình huống rành mạch: các nhóm đồ vật có số lượng bằng nhau được lặp lại. KHÔNG dùng kiến thức đo lường phức tạp.",
    "Phép cộng có nhớ trong phạm vi 100": "[DÀNH CHO LỚP 2] Các con số phải thiết kế để chắc chắn ra phép cộng CÓ NHỚ (tổng ở hàng đơn vị từ 10 trở lên). Cấm dùng số liệu quá 100.",
    "Đo độ dài (cm, m)": "[DÀNH CHO LỚP 2] BẮT BUỘC có nhắc đến đơn vị đo cm hoặc m. Đưa ra tình huống đo chiều dài vật dụng quen thuộc, hoặc độ dài quãng đường ngắn.",
    # Lớp 3
    "Diện tích hình chữ nhật": "[DÀNH CHO LỚP 3] BẮT BUỘC hỏi về tính diện tích hình chữ nhật (chiều dài x chiều rộng). Gắn với thực tế sinh động: phòng học, cái sân, bồn hoa. Văn phong Lớp 3.",
    "Phép chia có dư": "[DÀNH CHO LỚP 3] BẮT BUỘC số bị chia và số chia do AI chọn phải tạo ra SỐ DƯ (chia lớn nhưng không hết). Câu hỏi xoay quanh việc: chia đều được mấy phần và còn thừa/còn dư bao nhiêu chiếc.",
    "Bài toán nhiều bước": "[DÀNH CHO LỚP 3] Cốt lõi của Lớp 3 là tư duy giải quyết vấn đề. TUYỆT ĐỐI KHÔNG sinh bài giải bằng 1 bước/1 phép tính. BẮT BUỘC phải đòi hỏi từ 2 đến 3 phép tính liên tiếp mới ra đáp án."
}


class QuestionGenerator:
    def __init__(self):
        self.rag = RAGService()

    def generate_cpa_questions(
        self,
        topic: str,
        grade: int,
        objective: str,
        counts: Optional[Dict[str, int]] = None
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
            response = OllamaService.generate(prompt, system=system, temperature=0.3)
            questions = self._parse_json(response)
            result[level] = questions

        return result

    def generate_differentiation_questions(
        self,
        topic: str,
        grade: int,
        objective: str,
        tiers: Optional[List[str]] = None
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
            response = OllamaService.generate(prompt, system=system, temperature=0.3)
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
            
        topic_rule = TOPIC_RULES.get(topic, f"Bám sát nội dung Mẫu SGK được cung cấp. Phải phù hợp tuyệt đối với trình độ nhận thức Lớp {grade}.")

        return f"""NHIỆM VỤ: Sinh {count} bài toán phân hóa mức độ "{tier_label}" cho Lớp {grade}.

CHỦ ĐỀ: {topic}
MỤC TIÊU: {objective}

DANH SÁCH MẪU BÀI TẬP TỪ SGK (DÙNG LÀM KHUÔN MẪU):
{rag_context}

YÊU CẦU PHÂN HÓA MỨC ĐỘ "{tier_label}":
- Đặc điểm: {tier_cfg['must']}
- Cách biến đổi từ mẫu SGK: {tier_cfg['transformation']}

QUY TẮC NGÔN NGỮ & KIẾN THỨC (LỚP {grade}):
- Ràng buộc Trình độ & Chủ đề: {topic_rule}
- Giới hạn: {grade_cfg['limit']}
- Cấm: {grade_cfg['forbidden']}
- Văn phong: Giống hệt sách giáo khoa (ngắn gọn, trong sáng, dùng từ gần gũi: kẹo, bi, bạn Lan, nhà em...).
- Tuyệt đối không dùng từ Hán Việt khó hiểu hoặc cách đặt câu phức tạp.

ĐỊNH DẠNG ĐẦU RA:
- Trả về JSON array: [{{"question": "...", "answer": "...", "hint": "..."}}]
- Không kèm bất kỳ lời giải thích nào ngoài JSON.

HƯỚNG DẪN SINH BÀI:
Hãy chọn một cấu trúc bài trong phần "DANH SÁCH MẪU" rồi thực hiện "Cách biến đổi" để tạo ra bài mới cho mức độ {tier_label}. Đảm bảo bài sinh ra tự nhiên, đa dạng bối cảnh và KHÔNG lặp lại nếu sinh nhiều bài.

{VOCABULARY_SUGGESTIONS}
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
        if any(word in topic_lower for word in ["hình", "đo ", "dài", "rộng", "đoạn", "thời gian", "đồng hồ", "cm", "kg", "lít", "chu vi", "diện tích"]):
            operator_rule = "Chủ đề Hình học / Đo lường: KHÔNG bắt buộc phải có phép toán cộng trừ nhân chia. Tập trung vào nhận biết hình, đo lường."
        elif "cộng" in topic_lower or "tổng" in topic_lower or "thêm" in topic_lower:
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
            
        topic_rule = TOPIC_RULES.get(topic, f"Bám sát nội dung Mẫu SGK được cung cấp. Phải phù hợp tuyệt đối với trình độ nhận thức Lớp {grade}.")

        example = '[{"question": "<Nội dung câu hỏi phù hợp với Chủ đề và RAG...>", "answer": "<Đáp án và phép tính (nếu có)...>", "hint": "<Gợi ý cách làm...>"}]'

        return f"""NHIỆM VỤ: Sinh {count} bài toán dạng {desc} cho Lớp {grade}.

CHỦ ĐỀ: {topic}
MỤC TIÊU: {objective}

DANH SÁCH MẪU BÀI TẬP TỪ SGK (DÙNG ĐỂ HỌC TẬP CẤU TRÚC):
{rag_context}

TIÊU CHUẨN CPA RIÊNG CHO BÀI NÀY:
- {desc}

QUY TẮC BẮT BUỘC:
- Ràng buộc Toán tử: {operator_rule}
- Ràng buộc Trình độ & Chủ đề: {topic_rule}
- {positive_rule}
- {negative_rule}
- Văn phong: Ngắn gọn, trong sáng, đúng kiểu SGK Việt Nam. Không giải thích bên ngoài JSON.

MẪU VÍ DỤ PHẢI HỌC THEO VỀ MẶT CẤU TRÚC JSON:
```json
{example}
```

HƯỚNG DẪN SINH:
Dựa trên phong cách ngôn ngữ và bối cảnh (context) từ DANH SÁCH MẪU SGK bên trên, hãy tạo ra {count} bài mới phù hợp với mục tiêu {objective} và tiêu chuẩn {desc}. 
Đảm bảo bài toán tự nhiên, gần gũi như trong sách giáo khoa Lớp {grade}, đa dạng bối cảnh và KHÔNG lặp lại nếu sinh nhiều bài.

{VOCABULARY_SUGGESTIONS}

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
