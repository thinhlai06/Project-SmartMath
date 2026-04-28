"""
Question Generator - Generates CPA-style math questions using RAG + Qwen3.
"""
import json
import logging
import re
from typing import Any, Dict, List, Optional

from app.config import settings

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

TOPIC_METADATA_PROFILES = {
    "Phép cộng trong phạm vi 20": {
        "topic_slug": "phep_cong_20",
        "operation": "cong",
        "forbidden": ["tru", "nhan", "chia"],
    },
    "Phép trừ trong phạm vi 20": {
        "topic_slug": "phep_tru_20",
        "operation": "tru",
        "forbidden": ["cong", "nhan", "chia"],
    },
    "Hình học cơ bản": {
        "topic_slug": "hinh_hoc_co_ban",
        "operation": "hinh_hoc",
        "forbidden": ["cong", "tru", "nhan", "chia"],
    },
    "Bảng nhân 2, 5": {
        "topic_slug": "bang_nhan_2_5",
        "operation": "nhan",
        "forbidden": ["cong", "tru", "chia"],
    },
    "Phép cộng có nhớ trong phạm vi 100": {
        "topic_slug": "phep_cong_co_nho_100",
        "operation": "cong",
        "forbidden": ["tru", "nhan", "chia"],
    },
    "Đo độ dài (cm, m)": {
        "topic_slug": "do_do_dai",
        "operation": "do_luong",
        "forbidden": [],
    },
    "Diện tích hình chữ nhật": {
        "topic_slug": "dien_tich_hinh_chu_nhat",
        "operation": "hinh_hoc",
        "forbidden": [],
    },
    "Phép chia có dư": {
        "topic_slug": "phep_chia_co_du",
        "operation": "chia",
        "forbidden": ["nhan"],
    },
    "Bài toán nhiều bước": {
        "topic_slug": "bai_toan_nhieu_buoc",
        "operation": "tong_hop",
        "forbidden": [],
    },
}

TIER_ORDER = ["foundation", "standard", "extension", "advanced"]

TIER_GUIDE = {
    "foundation": "Yeu cau truc tiep, 1 buoc, du kien ro rang.",
    "standard": "Yeu cau van la truc tiep, co the can 1-2 buoc.",
    "extension": "Yeu cau xu ly du kien truoc khi tinh, 2 buoc tro len.",
    "advanced": "Yeu cau suy luan gian tiep hoac dao bai, khong trung voi extension.",
}


class QuestionGenerator:
    def __init__(self):
        self.rag = RAGService()

    # ------------------------------------------------------------------
    # Backward-compatible entrypoints
    # ------------------------------------------------------------------

    def generate_cpa_questions(
        self,
        topic: str,
        grade: int,
        objective: str,
        counts: Optional[Dict[str, int]] = None,
    ) -> Dict:
        return self.generate_cpa_questions_new(topic=topic, grade=grade, objective=objective, counts=counts)

    def generate_differentiation_questions(
        self,
        topic: str,
        grade: int,
        objective: str,
        tiers: Optional[List[str]] = None,
    ) -> Dict:
        return self.generate_differentiation_questions_new(
            topic=topic,
            grade=grade,
            objective=objective,
            tiers=tiers,
        )

    # ------------------------------------------------------------------
    # Legacy pipeline (kept for safe rollout)
    # ------------------------------------------------------------------

    def generate_cpa_questions_legacy(
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

    def generate_differentiation_questions_legacy(
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

    # ------------------------------------------------------------------
    # New pipeline: template-first retrieval + ladder generation
    # ------------------------------------------------------------------

    def generate_cpa_questions_new(
        self,
        topic: str,
        grade: int,
        objective: str,
        counts: Optional[Dict[str, int]] = None,
    ) -> Dict:
        if counts is None:
            counts = {"concrete": 3, "pictorial": 3, "abstract": 3}

        result: Dict[str, Any] = {
            "concrete": [],
            "pictorial": [],
            "abstract": [],
            "rag_sources": [],
            "generation_mode": "new",
            "template_seed_count": {},
            "retrieval_filter_applied": {},
        }

        all_sources: set[str] = set()
        for level in ["concrete", "pictorial", "abstract"]:
            count = counts.get(level, 3)
            if count <= 0:
                result["template_seed_count"][level] = 0
                continue

            seeds, sources, filter_applied = self._retrieve_template_seeds(
                topic=topic,
                grade=grade,
                objective=objective,
                representation=level,
                tier=None,
                k=4,
            )
            all_sources.update(sources)

            result["template_seed_count"][level] = len(seeds)
            result["retrieval_filter_applied"][level] = filter_applied

            prompt = self._build_cpa_seed_prompt(
                level=level,
                topic=topic,
                grade=grade,
                objective=objective,
                count=count,
                seeds=seeds,
            )
            system = (
                "Ban la chuyen gia giao duc Toan tieu hoc Viet Nam. "
                "Chi sinh bai moi trong bien topic duoc khoa. Tra ve JSON array."
            )
            response = OllamaService.generate(prompt, system=system, temperature=0.2)
            result[level] = self._parse_json(response)

        result["rag_sources"] = sorted(list(all_sources))
        return result

    def generate_differentiation_questions_new(
        self,
        topic: str,
        grade: int,
        objective: str,
        tiers: Optional[List[str]] = None,
    ) -> Dict:
        if not tiers:
            tiers = ["foundation", "standard", "extension", "advanced"]

        normalized_tiers = [t for t in TIER_ORDER if t in tiers]
        if not normalized_tiers:
            normalized_tiers = TIER_ORDER.copy()

        seeds, sources, filter_applied = self._retrieve_template_seeds(
            topic=topic,
            grade=grade,
            objective=objective,
            representation=None,
            tier=normalized_tiers[0],
            k=5,
        )

        prompt = self._build_ladder_prompt(
            topic=topic,
            grade=grade,
            objective=objective,
            tiers=normalized_tiers,
            seeds=seeds,
            per_tier_count=2,
        )
        system = (
            "Ban la chuyen gia giao duc Toan tieu hoc Viet Nam. "
            "Tao difficulty ladder tang dan do kho va khong trung dang giua cac muc."
        )
        response = OllamaService.generate(prompt, system=system, temperature=0.2)
        parsed_content = self._parse_ladder_json(response, normalized_tiers)

        validation = {
            "enabled": bool(settings.AI_GEN_ENABLE_DIFFICULTY_VALIDATOR),
            "passes": True,
            "issues": [],
            "repair_attempts": 0,
        }

        if settings.AI_GEN_ENABLE_DIFFICULTY_VALIDATOR:
            validation = self._validate_ladder(
                content=parsed_content,
                topic=topic,
                grade=grade,
                tiers=normalized_tiers,
            )

            max_rounds = max(0, int(settings.AI_GEN_MAX_REPAIR_ROUNDS))
            attempts = 0
            while not validation.get("passes", False) and attempts < max_rounds:
                attempts += 1
                parsed_content = self._repair_ladder(
                    content=parsed_content,
                    topic=topic,
                    grade=grade,
                    objective=objective,
                    tiers=normalized_tiers,
                    seeds=seeds,
                    issues=validation.get("issues", []),
                )
                validation = self._validate_ladder(
                    content=parsed_content,
                    topic=topic,
                    grade=grade,
                    tiers=normalized_tiers,
                )
                validation["repair_attempts"] = attempts

        result: Dict[str, Any] = {
            "content": {tier: parsed_content.get(tier, []) for tier in normalized_tiers},
            "rag_sources": sorted(list(set(sources))),
            "generation_mode": "new",
            "template_seed_count": len(seeds),
            "retrieval_filter_applied": filter_applied,
            "validation_summary": validation,
        }
        return result

    # ------------------------------------------------------------------
    # Template seed helpers
    # ------------------------------------------------------------------

    def _topic_profile(self, topic: str) -> Dict[str, Any]:
        return TOPIC_METADATA_PROFILES.get(
            topic,
            {
                "topic_slug": self._slugify(topic),
                "operation": "tong_hop",
                "forbidden": [],
            },
        )

    def _slugify(self, value: str) -> str:
        ascii_like = value.lower()
        replace_map = {
            "đ": "d",
            "á": "a", "à": "a", "ả": "a", "ã": "a", "ạ": "a",
            "ă": "a", "ắ": "a", "ằ": "a", "ẳ": "a", "ẵ": "a", "ặ": "a",
            "â": "a", "ấ": "a", "ầ": "a", "ẩ": "a", "ẫ": "a", "ậ": "a",
            "é": "e", "è": "e", "ẻ": "e", "ẽ": "e", "ẹ": "e",
            "ê": "e", "ế": "e", "ề": "e", "ể": "e", "ễ": "e", "ệ": "e",
            "í": "i", "ì": "i", "ỉ": "i", "ĩ": "i", "ị": "i",
            "ó": "o", "ò": "o", "ỏ": "o", "õ": "o", "ọ": "o",
            "ô": "o", "ố": "o", "ồ": "o", "ổ": "o", "ỗ": "o", "ộ": "o",
            "ơ": "o", "ớ": "o", "ờ": "o", "ở": "o", "ỡ": "o", "ợ": "o",
            "ú": "u", "ù": "u", "ủ": "u", "ũ": "u", "ụ": "u",
            "ư": "u", "ứ": "u", "ừ": "u", "ử": "u", "ữ": "u", "ự": "u",
            "ý": "y", "ỳ": "y", "ỷ": "y", "ỹ": "y", "ỵ": "y",
        }
        for src, dst in replace_map.items():
            ascii_like = ascii_like.replace(src, dst)
        ascii_like = re.sub(r"[^a-z0-9]+", "_", ascii_like).strip("_")
        return ascii_like or "topic"

    def _retrieve_template_seeds(
        self,
        topic: str,
        grade: int,
        objective: str,
        representation: Optional[str],
        tier: Optional[str],
        k: int,
    ) -> tuple[list[dict], list[str], dict]:
        profile = self._topic_profile(topic)
        metadata_filter: Dict[str, Any] = {}

        if settings.AI_GEN_ENABLE_TEMPLATE_FILTER:
            metadata_filter["topic_slug"] = profile["topic_slug"]
            if representation:
                metadata_filter["representation"] = representation
            if tier:
                metadata_filter["difficulty_band"] = tier

        query = f"{topic} {objective}".strip()
        docs = self.rag.retrieve_with_filter(
            query=query,
            grade=grade,
            k=k,
            metadata_filter=metadata_filter,
            allow_filter_fallback=True,
        )

        seeds = [self._doc_to_seed(d, profile, representation) for d in docs[:3]]
        if not seeds:
            seeds = [self._fallback_seed(topic, grade, representation)]

        sources = [d.metadata.get("source_file", "SGK") for d in docs]
        return seeds, sources, metadata_filter

    def _doc_to_seed(
        self,
        doc: Any,
        profile: Dict[str, Any],
        representation: Optional[str],
    ) -> Dict[str, str]:
        text = (doc.page_content or "").strip()
        lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
        sample = lines[0] if lines else text[:120]
        sample = sample[:220]
        template_type = doc.metadata.get("template_type") or "loi_van"
        skill = doc.metadata.get("skill") or "nhan_biet"
        return {
            "dang_bai": template_type,
            "kien_thuc_loi": profile["topic_slug"],
            "hanh_dong": "tinh/nhan_dien/dien_so theo yeu cau",
            "gioi_han": f"Chi trong topic {profile['topic_slug']} va lop {doc.metadata.get('grade', '')}",
            "dieu_cam": ", ".join(profile.get("forbidden", [])) or "khong vuot topic",
            "mau_cau": sample,
            "skill": skill,
            "representation": representation or doc.metadata.get("representation", "abstract"),
        }

    def _fallback_seed(self, topic: str, grade: int, representation: Optional[str]) -> Dict[str, str]:
        profile = self._topic_profile(topic)
        return {
            "dang_bai": "co_ban",
            "kien_thuc_loi": profile["topic_slug"],
            "hanh_dong": "lam theo dung yeu cau cau hoi",
            "gioi_han": f"Chi dung kien thuc toan lop {grade}",
            "dieu_cam": ", ".join(profile.get("forbidden", [])) or "khong vuot topic",
            "mau_cau": f"Bai toan ve {topic} cho lop {grade}",
            "skill": "nhan_biet",
            "representation": representation or "abstract",
        }

    # ------------------------------------------------------------------
    # Prompt builders for new pipeline
    # ------------------------------------------------------------------

    def _build_cpa_seed_prompt(
        self,
        level: str,
        topic: str,
        grade: int,
        objective: str,
        count: int,
        seeds: List[Dict[str, str]],
    ) -> str:
        seed_lines = []
        for idx, seed in enumerate(seeds, 1):
            seed_lines.append(
                f"Seed {idx}: dang_bai={seed['dang_bai']}; kien_thuc_loi={seed['kien_thuc_loi']}; "
                f"hanh_dong={seed['hanh_dong']}; gioi_han={seed['gioi_han']}; dieu_cam={seed['dieu_cam']}; "
                f"mau_cau={seed['mau_cau']}"
            )

        level_hint = {
            "concrete": "Dung ngu canh vat that gan gui, tranh phep tinh tran trai neu khong can.",
            "pictorial": "Mo ta bang hinh anh/so do don gian.",
            "abstract": "Bieu dien bang so va phep tinh ro rang.",
        }.get(level, "Bam sat dang bai da khoa.")

        return f"""NHIEM VU: Sinh {count} cau hoi CPA cho lop {grade}.
CHU DE: {topic}
MUC TIEU: {objective}
CAP DO CPA: {level}

TEMPLATE SEEDS (KHONG VUOT RA NGOAI):
{chr(10).join(seed_lines)}

RANG BUOC:
- Chi sinh trong topic da khoa.
- {level_hint}
- Neu seed co dieu_cam thi bat buoc tuan thu.
- Cau hoi day du nghia, khong cat cụt.

DINH DANG DAU RA:
- JSON array duy nhat: [{{"question":"...","answer":"...","hint":"..."}}]
- Khong tra ve van ban ngoai JSON.
"""

    def _build_ladder_prompt(
        self,
        topic: str,
        grade: int,
        objective: str,
        tiers: List[str],
        seeds: List[Dict[str, str]],
        per_tier_count: int,
    ) -> str:
        seed_lines = []
        for idx, seed in enumerate(seeds, 1):
            seed_lines.append(
                f"Seed {idx}: dang_bai={seed['dang_bai']}; kien_thuc_loi={seed['kien_thuc_loi']}; "
                f"hanh_dong={seed['hanh_dong']}; dieu_cam={seed['dieu_cam']}; mau_cau={seed['mau_cau']}"
            )

        tier_rules = [f"- {tier}: {TIER_GUIDE.get(tier, '')}" for tier in tiers]
        profile = self._topic_profile(topic)

        return f"""NHIEM VU: Tao bo difficulty ladder cho Toan lop {grade}.
CHU DE: {topic}
MUC TIEU: {objective}
TIER BAT BUOC: {', '.join(tiers)}
SO CAU MOI TIER: {per_tier_count}

TEMPLATE SEEDS (CHI DUOC BIEN DOI TU CAC SEED NAY):
{chr(10).join(seed_lines)}

RUBRIC TANG DO KHO:
{chr(10).join(tier_rules)}

RANG BUOC TOPIC:
- topic_slug: {profile['topic_slug']}
- operation: {profile['operation']}
- dieu_cam: {', '.join(profile.get('forbidden', [])) or 'khong vuot topic'}

YEU CAU CHAT LUONG:
- Moi cau phai day du ngu nghia, du du kien de tra loi.
- Extension va Advanced KHONG duoc trung cau truc.
- Advanced phai kho hon Extension ve suy luan, khong chi tang so.

DINH DANG DAU RA:
JSON object duy nhat theo mau:
{{
  "content": {{
    "foundation": [{{"question":"...","answer":"...","hint":"..."}}],
    "standard": [{{"question":"...","answer":"...","hint":"..."}}],
    "extension": [{{"question":"...","answer":"...","hint":"..."}}],
    "advanced": [{{"question":"...","answer":"...","hint":"..."}}]
  }}
}}
"""

    # ------------------------------------------------------------------
    # Validator & repair for ladder
    # ------------------------------------------------------------------

    def _parse_ladder_json(self, text: str, tiers: List[str]) -> Dict[str, List[Dict[str, str]]]:
        content = {tier: [] for tier in tiers}
        clean = re.sub(r"^```json?|```$", "", (text or "").strip(), flags=re.MULTILINE).strip()
        try:
            loaded = json.loads(clean)
            if isinstance(loaded, dict) and isinstance(loaded.get("content"), dict):
                for tier in tiers:
                    tier_val = loaded["content"].get(tier, [])
                    content[tier] = tier_val if isinstance(tier_val, list) else []
                return content
            if isinstance(loaded, dict):
                for tier in tiers:
                    tier_val = loaded.get(tier, [])
                    content[tier] = tier_val if isinstance(tier_val, list) else []
                return content
        except Exception:
            pass
        return content

    def _validate_ladder(
        self,
        content: Dict[str, List[Dict[str, str]]],
        topic: str,
        grade: int,
        tiers: List[str],
    ) -> Dict[str, Any]:
        issues: List[Dict[str, str]] = []

        for tier in tiers:
            questions = content.get(tier, [])
            if not questions:
                issues.append({"tier": tier, "reason": "Tier khong co cau hoi."})
                continue

            for idx, item in enumerate(questions, 1):
                question = str(item.get("question", "")).strip()
                answer = str(item.get("answer", "")).strip()
                if not question or len(question) < 8:
                    issues.append({"tier": tier, "reason": f"Cau {idx} bi cut hoac qua ngan."})
                if not answer:
                    issues.append({"tier": tier, "reason": f"Cau {idx} thieu dap an."})
                if not self._is_question_topic_compliant(question=question, answer=answer, topic=topic):
                    issues.append({"tier": tier, "reason": f"Cau {idx} lech topic da khoa."})
                if not self._is_grade_compliant(question=question, grade=grade):
                    issues.append({"tier": tier, "reason": f"Cau {idx} vuot muc do lop {grade}."})

        if "extension" in content and "advanced" in content:
            ext_q = " ".join([str(i.get("question", "")) for i in content.get("extension", [])]).lower()
            adv_q = " ".join([str(i.get("question", "")) for i in content.get("advanced", [])]).lower()
            if self._normalize_text(ext_q) == self._normalize_text(adv_q):
                issues.append({"tier": "advanced", "reason": "Advanced trung cau truc voi Extension."})

        complexity_by_tier = []
        for tier in tiers:
            tier_questions = content.get(tier, [])
            if not tier_questions:
                complexity_by_tier.append(0.0)
                continue
            avg = sum(self._complexity_score(str(q.get("question", ""))) for q in tier_questions) / len(tier_questions)
            complexity_by_tier.append(avg)

        for i in range(1, len(complexity_by_tier)):
            if complexity_by_tier[i] + 0.1 < complexity_by_tier[i - 1]:
                issues.append({
                    "tier": tiers[i],
                    "reason": "Do kho khong tang dan theo ladder.",
                })

        return {
            "enabled": True,
            "passes": len(issues) == 0,
            "issues": issues,
        }

    def _repair_ladder(
        self,
        content: Dict[str, List[Dict[str, str]]],
        topic: str,
        grade: int,
        objective: str,
        tiers: List[str],
        seeds: List[Dict[str, str]],
        issues: List[Dict[str, str]],
    ) -> Dict[str, List[Dict[str, str]]]:
        issue_text = "\n".join([f"- {it.get('tier')}: {it.get('reason')}" for it in issues])
        seed_text = "\n".join([
            f"Seed {idx}: dang_bai={seed['dang_bai']}; mau_cau={seed['mau_cau']}; dieu_cam={seed['dieu_cam']}"
            for idx, seed in enumerate(seeds, 1)
        ])

        prompt = f"""HAY SUA BO CAU HOI PHAN HOA.
CHU DE: {topic}
LOP: {grade}
MUC TIEU: {objective}

LOI CAN SUA:
{issue_text}

TEMPLATE SEEDS (KHONG DUOC VUOT TOPIC):
{seed_text}

NOI DUNG HIEN TAI:
{json.dumps({'content': content}, ensure_ascii=False)}

YEU CAU:
- Chi sua cac cau bi loi.
- Giu nguyen tier va cau dung.
- Khong duoc doi topic.
- Tra ve duy nhat JSON object theo key 'content'.
"""
        response = OllamaService.generate(
            prompt=prompt,
            system="Ban la giao vien sua bai, sua dung loi va giu nguyen chu de.",
            temperature=0.1,
        )
        return self._parse_ladder_json(response, tiers)

    def _is_question_topic_compliant(self, question: str, answer: str, topic: str) -> bool:
        q = self._normalize_for_checks(question)
        a = self._normalize_for_checks(answer)
        topic_norm = self._normalize_for_checks(topic)
        if topic_norm == "hinh hoc co ban":
            return not any(op in q for op in ["+", "-", "x", ":", "nhan", "chia"]) and "hinh" in q
        if topic_norm == "phep chia co du":
            return ("du" in q) or ("du" in a)
        if "phep cong" in topic_norm:
            return "+" in q or "cong" in q or "+" in a
        if "phep tru" in topic_norm:
            return "-" in q or "tru" in q or "-" in a
        return True

    def _is_grade_compliant(self, question: str, grade: int) -> bool:
        q = self._normalize_for_checks(question)
        if grade == 1:
            if any(token in q for token in ["phan so", "%", "thap phan"]):
                return False
        if grade in (1, 2):
            if any(token in q for token in ["phuong trinh", "lap luan chung minh"]):
                return False
        return True

    def _complexity_score(self, question: str) -> float:
        q = (question or "").lower()
        score = 0.0
        score += len(q) / 120.0
        score += q.count("?") * 0.2
        score += sum(q.count(op) for op in ["+", "-", "x", ":", "nhan", "chia"]) * 0.3
        for kw in ["vi sao", "giai thich", "con lai", "sau do", "tim so", "neu"]:
            if kw in q:
                score += 0.4
        return score

    def _normalize_text(self, text: str) -> str:
        txt = re.sub(r"\s+", " ", (text or "").lower()).strip()
        txt = re.sub(r"\d+", "#", txt)
        return txt

    def _normalize_for_checks(self, text: str) -> str:
        raw = (text or "").lower()
        replace_map = {
            "đ": "d",
            "á": "a", "à": "a", "ả": "a", "ã": "a", "ạ": "a",
            "ă": "a", "ắ": "a", "ằ": "a", "ẳ": "a", "ẵ": "a", "ặ": "a",
            "â": "a", "ấ": "a", "ầ": "a", "ẩ": "a", "ẫ": "a", "ậ": "a",
            "é": "e", "è": "e", "ẻ": "e", "ẽ": "e", "ẹ": "e",
            "ê": "e", "ế": "e", "ề": "e", "ể": "e", "ễ": "e", "ệ": "e",
            "í": "i", "ì": "i", "ỉ": "i", "ĩ": "i", "ị": "i",
            "ó": "o", "ò": "o", "ỏ": "o", "õ": "o", "ọ": "o",
            "ô": "o", "ố": "o", "ồ": "o", "ổ": "o", "ỗ": "o", "ộ": "o",
            "ơ": "o", "ớ": "o", "ờ": "o", "ở": "o", "ỡ": "o", "ợ": "o",
            "ú": "u", "ù": "u", "ủ": "u", "ũ": "u", "ụ": "u",
            "ư": "u", "ứ": "u", "ừ": "u", "ử": "u", "ữ": "u", "ự": "u",
            "ý": "y", "ỳ": "y", "ỷ": "y", "ỹ": "y", "ỵ": "y",
        }
        for src, dst in replace_map.items():
            raw = raw.replace(src, dst)
        raw = re.sub(r"\s+", " ", raw).strip()
        return raw

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
