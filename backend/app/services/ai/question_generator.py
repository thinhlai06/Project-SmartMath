"""Question Generator service for differentiation drafts using RAG + Ollama."""
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
- Bối cảnh: trong lớp học, ở nhà, ngoài sân trường, trong cửa hàng, vườn trường...
- Hình học (nhận biết hình): hình vuông, hình tròn, hình tam giác, hình chữ nhật; cạnh, đỉnh, góc vuông; viên gạch/tờ giấy (hình chữ nhật), đồng hồ/bánh xe (hình tròn), biển báo/nón lá (hình tam giác)...
- Hình học (tính toán): chiều dài, chiều rộng, cạnh, chu vi C =, diện tích S =, m², cm²...
- Đo lường: cm, m, km; kg, g; lít, ml; giờ, phút; dài hơn, ngắn hơn, nặng hơn, nhẹ hơn, bằng nhau...
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

_OPERATION_TO_FAMILY: Dict[str, str] = {
    "hinh_hoc": "geometry",
    "do_luong": "measurement",
    "cong": "arithmetic",
    "tru": "arithmetic",
    "nhan": "arithmetic",
    "chia": "arithmetic",
    "tong_hop": "arithmetic",
}

FAMILY_CONSTRAINT_OVERRIDES: Dict[str, Dict[str, str]] = {
    "geometry": {
        "operations": "KHONG bat buoc phep tinh so hoc thuan tuy. Tap trung: nhan biet/phan biet hinh dang, dem hinh, tinh chu vi/dien tich bang cong thuc phu hop cap do.",
        "steps": "1 yeu cau ro rang: nhan biet HOAC tinh theo 1 cong thuc duy nhat.",
    },
    "measurement": {
        "operations": "Phep cong/tru de tinh toan do luong va doi don vi. BAT BUOC ghi ro don vi do kem theo moi ket qua.",
        "steps": "1-2 buoc; it nhat 1 buoc lien quan truc tiep den don vi do.",
    },
}

TIER_ORDER = ["foundation", "standard", "extension", "advanced"]

GRADE_NUMBER_CONSTRAINTS = {
    1: {
        "range": "Chi dung so tu 0 den 20 (toi da 100 cho bai dem so). TUYET DOI KHONG dung so lon hon 100.",
        "operations": "Chi phep cong va phep tru. KHONG nhan, KHONG chia.",
        "steps": "Moi bai chi 1 buoc tinh duy nhat.",
        "language": "Cau van cuc ngan, don gian, dung tu quen thuoc: keo, bi, ban An, qua tao.",
        "forbidden": "CAM: tong day so, chuoi so, phan so, %, so thap phan, nhieu buoc tinh.",
    },
    2: {
        "range": "Pham vi so den 1000. Phep nhan/chia chi bang 2,3,4,5.",
        "operations": "Cong/tru co nho trong pham vi 100. Nhan/chia co ban.",
        "steps": "Toi da 2 buoc tinh.",
        "language": "Van phong SGK lop 2, cau truc ro rang.",
        "forbidden": "CAM: phan so, %, so thap phan, kien thuc lop 3.",
    },
    3: {
        "range": "Pham vi so den 100.000. Nhan so co 1-2 chu so. Chia so co 1 chu so.",
        "operations": "Cong/tru/nhan/chia. Co the chia co du.",
        "steps": "2-3 buoc tinh.",
        "language": "Van phong SGK lop 3.",
        "forbidden": "CAM: phan so phuc tap, so thap phan, hinh hoc cap 2.",
    },
}

TIER_GUIDE_BY_GRADE: Dict[int, Dict[str, Dict[str, str]]] = {
    1: {
        "arithmetic": {
            "foundation": "Phep tinh 1 buoc cuc don gian (pham vi 10). VD: 3 + 2 = ?",
            "standard": "Bai toan loi van 1 buoc them/bot (pham vi 20). VD: An co 5 qua tao, me cho them 3 qua. Hoi An co tat ca bao nhieu qua?",
            "extension": "Bai toan so sanh nhieu hon/it hon (pham vi 20). VD: Lan co 7 cai keo, nhieu hon Binh 3 cai. Hoi Binh co may cai keo?",
            "advanced": "Bai toan tim so chua biet / dao nguoc (pham vi 20). VD: ? + 4 = 9. Tim so can dien.",
        },
        "geometry": {
            "foundation": "Nhan biet ten hinh tu hinh ve/anh. VD: Trong tranh co may hinh vuong? Chi ra chung.",
            "standard": "Phan biet va dem cac loai hinh trong mot tranh co nhieu hinh. VD: Dem xem co bao nhieu hinh tam giac va bao nhieu hinh tron.",
            "extension": "Lien he hinh voi do vat thuc te. VD: Ke ten 2 do vat trong lop co dang hinh vuong va 2 do vat co dang hinh tron.",
            "advanced": "Mo ta dac diem hinh de phan biet. VD: Hinh nao co 3 canh? Hinh nao co 4 canh bang nhau? Giai thich tai sao.",
        },
        "measurement": {
            "foundation": "Doc gia tri do duoc tu vat cu the (don vi cm). VD: Cay but nay dai bao nhieu cm?",
            "standard": "So sanh do dai 2 vat bang don vi cm. VD: Bam chu dai 12cm, but chi dai 9cm. Bam chu dai hon but chi bao nhieu cm?",
            "extension": "Uoc tinh do dai bang don vi tu nhien (gang tay, buoc chan). VD: Do bang gang tay, ban hoc rong khoang bao nhieu gang tay?",
            "advanced": "Bai toan co loi van 1 buoc ve do dai. VD: Day ruy bang dai 15cm, cat di 6cm. Con lai bao nhieu cm?",
        },
    },
    2: {
        "arithmetic": {
            "foundation": "Tinh nham hoac dat tinh truc tiep (pham vi 100). VD: 47 + 35 = ?",
            "standard": "Bai toan loi van 1-2 buoc (pham vi 1000). VD: Mot cua hang co 125 quyen vo, ban di 47 quyen. Con bao nhieu quyen?",
            "extension": "Bai toan ket hop cong/tru va nhan/chia co ban. VD: Co 4 hop, moi hop 5 but, bo them 3 but. Tong cong bao nhieu but?",
            "advanced": "Bai toan 2 buoc co suy luan gian tiep. VD: Me mua 3 tui cam, moi tui 5 qua, cho ba 7 qua. Me con lai bao nhieu qua?",
        },
        "geometry": {
            "foundation": "Tinh chu vi hinh vuong/HCN bang cach dem va cong canh. VD: Hinh vuong canh 4cm, chu vi = ?",
            "standard": "Tinh chu vi HCN biet chieu dai va chieu rong. VD: HCN dai 8cm rong 5cm, chu vi = ?",
            "extension": "Bai toan chu vi co doi don vi (m va cm). VD: Vuon hinh chu nhat dai 2m, rong 80cm. Chu vi bang bao nhieu cm?",
            "advanced": "Tim canh khi biet chu vi. VD: Hinh vuong co chu vi 32cm. Tinh do dai canh hinh vuong.",
        },
        "measurement": {
            "foundation": "Doi don vi don gian trong pham vi nho (m↔cm, kg↔g). VD: 2m = ? cm",
            "standard": "Bai toan 1 buoc ve do luong co don vi. VD: Soi day dai 85cm, cat di 37cm. Con lai bao nhieu cm?",
            "extension": "Doi don vi va tinh toan ket hop. VD: An co 1m 20cm vai, may het 65cm. Con lai bao nhieu cm?",
            "advanced": "Bai toan 2 buoc ve do luong. VD: Cuon len 3m vai, cat 2 doan moi 70cm. Con lai bao nhieu cm?",
        },
    },
    3: {
        "arithmetic": {
            "foundation": "Thuc hien phep tinh co ban (pham vi 10.000). VD: 234 x 3 = ?",
            "standard": "Bai toan loi van 2 buoc (pham vi 100.000). VD: Truong co 245 hoc sinh nam va 198 hoc sinh nu. Tong cong bao nhieu?",
            "extension": "Bai toan tong hop 2-3 buoc, du kien can xu ly truoc. VD: Mua 5 hop but, moi hop 12 cai, da dung 23 cai. Con lai bao nhieu cai?",
            "advanced": "Bai toan tu duy / tim quy luat. VD: Tim so tu nhien x biet x chia 7 du 3 va x < 50.",
        },
        "geometry": {
            "foundation": "Tinh dien tich HCN truc tiep theo cong thuc S = dai x rong. VD: HCN dai 6cm rong 4cm, S = ?",
            "standard": "Bai toan loi van tinh dien tich 1 buoc. VD: San choi HCN dai 20m rong 12m, dien tich bang bao nhieu?",
            "extension": "Tinh dien tich khi phai tinh them 1 chieu truoc. VD: HCN co chu vi 36cm, chieu dai gap 2 chieu rong. Tinh dien tich.",
            "advanced": "Bai toan dien tich 2-3 buoc co suy luan. VD: Manh dat HCN 10mx6m, cat di 1 goc hinh vuong 2mx2m. Dien tich phan con lai?",
        },
        "measurement": {
            "foundation": "Doi don vi pham vi kilo (km↔m, kg↔g, l↔ml). VD: 3km = ? m",
            "standard": "Bai toan loi van 1-2 buoc ve do luong. VD: Xe chay 4 gio, moi gio 45km. Tinh quang duong.",
            "extension": "Doi don vi va ap dung thuc te. VD: Binh chua 3l 5dl nuoc, can them bao nhieu dl de day 5 lit?",
            "advanced": "Bai toan 2-3 buoc co suy luan ve do luong. VD: 3 binh chua tong 12 lit, binh lon gap 3 binh nho. Tinh so lit moi binh.",
        },
    },
}


class QuestionGenerator:
    def __init__(self):
        self.rag = RAGService()

    # ------------------------------------------------------------------
    # Entry points
    # ------------------------------------------------------------------

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
            response = OllamaService.generate_cloud(prompt, system=system, temperature=0.3, max_tokens=2048, format="json")
            questions = self._parse_json(response)
            result["content"][tier] = questions

        return result

    # ------------------------------------------------------------------
    # New pipeline: template-first retrieval + ladder generation
    # ------------------------------------------------------------------

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
            "Tao difficulty ladder tang dan do kho va khong trung dang giua cac muc. CHI TRA VE JSON HOP LE, KHONG DUNG MARKDOWN."
        )
        response = OllamaService.generate_cloud(prompt, system=system, temperature=0.2, max_tokens=2048, format="json")
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

        profile = self._topic_profile(topic)
        operation = profile.get("operation", "")
        content_family = _OPERATION_TO_FAMILY.get(operation, "arithmetic")

        grade_tier_guide = TIER_GUIDE_BY_GRADE.get(grade, TIER_GUIDE_BY_GRADE[3])
        family_tier_guide = grade_tier_guide.get(content_family, grade_tier_guide["arithmetic"])
        tier_rules = [f"- {tier}: {family_tier_guide.get(tier, '')}" for tier in tiers]

        grade_constraints = GRADE_NUMBER_CONSTRAINTS.get(grade, GRADE_NUMBER_CONSTRAINTS[3])
        family_overrides = FAMILY_CONSTRAINT_OVERRIDES.get(content_family, {})
        effective_operations = family_overrides.get("operations", grade_constraints["operations"])
        effective_steps = family_overrides.get("steps", grade_constraints["steps"])

        topic_rule = TOPIC_RULES.get(topic)
        topic_rule_text = topic_rule if topic_rule else "Khong co quy tac rieng, bam sat seeds va dung trinh do lop da chon."

        return f"""NHIEM VU: Tao bo difficulty ladder cho Toan lop {grade}.
CHU DE: {topic}
MUC TIEU: {objective}
TIER BAT BUOC: {', '.join(tiers)}
SO CAU MOI TIER: {per_tier_count}

TEMPLATE SEEDS (CHI DUOC BIEN DOI TU CAC SEED NAY):
{chr(10).join(seed_lines)}

RANG BUOC LOP {grade} (BAT BUOC TUAN THU):
- Pham vi so: {grade_constraints['range']}
- Phep tinh / yeu cau chinh: {effective_operations}
- So buoc: {effective_steps}
- Ngon ngu: {grade_constraints['language']}
- {grade_constraints['forbidden']}

RANG BUOC CHU DE (BAT BUOC):
- {topic_rule_text}

RUBRIC TANG DO KHO:
{chr(10).join(tier_rules)}

RANG BUOC TOPIC:
- topic_slug: {profile['topic_slug']}
- operation: {profile['operation']}
- dieu_cam: {', '.join(profile.get('forbidden', [])) or 'khong vuot topic'}

YEU CAU CHAT LUONG:
- Bam sat ngon ngu va dang bai trong TEMPLATE SEEDS, khong duoc nhay sang dang bai ngoai SGK lop nay.
- Moi cau phai day du ngu nghia, du du kien de tra loi.
- Extension va Advanced KHONG duoc trung cau truc.
- Advanced phai kho hon Extension ve suy luan, khong chi tang so.

GOI Y TU VUNG TU NHIEN:
{VOCABULARY_SUGGESTIONS}

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
- TRA VE DUY NHAT JSON OBJECT. KHONG GIAI THICH, KHONG DUNG MARKDOWN.
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

                numbers_in_q = re.findall(r"\d+", f"{question} {answer}")
                max_allowed = {1: 100, 2: 1000, 3: 100000}
                limit = max_allowed.get(grade, 100000)
                for num_str in numbers_in_q:
                    if len(num_str) <= 8 and int(num_str) > limit:
                        issues.append(
                            {
                                "tier": tier,
                                "reason": f"Cau {idx} chua so {num_str} vuot pham vi lop {grade}.",
                            }
                        )

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
- TRA VE DUY NHAT JSON OBJECT. KHONG GIAI THICH, KHONG DUNG MARKDOWN.
"""
        response = OllamaService.generate_cloud(
            prompt=prompt,
            system="Ban la giao vien sua bai, sua dung loi va giu nguyen chu de.",
            temperature=0.1,
            max_tokens=2048,
            format="json",
        )
        return self._parse_ladder_json(response, tiers)

    def _is_question_topic_compliant(self, question: str, answer: str, topic: str) -> bool:
        q = self._normalize_for_checks(question)
        a = self._normalize_for_checks(answer)
        topic_norm = self._normalize_for_checks(topic)
        if topic_norm == "hinh hoc co ban":
            return not any(op in q for op in ["+", "-", "x", ":", "nhan", "chia"]) and "hinh" in q
        if topic_norm == "dien tich hinh chu nhat":
            has_area_keyword = any(kw in q or kw in a for kw in ["dien tich", "s =", "s=", "m2", "cm2"])
            return has_area_keyword
        if topic_norm == "do do dai (cm, m)" or topic_norm == "do do dai":
            has_unit = any(u in q or u in a for u in ["cm", " m ", "met", "km", "mm"])
            return has_unit
        if topic_norm == "phep chia co du":
            return ("du" in q) or ("du" in a)
        if "phep cong" in topic_norm:
            return "+" in q or "cong" in q or "+" in a
        if "phep tru" in topic_norm:
            return "-" in q or "tru" in q or "-" in a
        return True

    def _is_grade_compliant(self, question: str, grade: int) -> bool:
        q = self._normalize_for_checks(question)
        numbers = re.findall(r"\d+", question)
        int_numbers = [int(n) for n in numbers if len(n) <= 8]

        if grade == 1:
            if any(n > 100 for n in int_numbers):
                return False
            if any(token in q for token in ["phan so", "%", "thap phan", "tong day so", "tong cac so tu"]):
                return False
            if re.search(r"\d+\s*[x:]\s*\d+", q):
                return False
            if any(token in q for token in ["phep nhan", "phep chia", "bang nhan", "bang chia"]):
                return False
        if grade == 2:
            if any(n > 1000 for n in int_numbers):
                return False
        if grade == 3:
            if any(n > 100000 for n in int_numbers):
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
