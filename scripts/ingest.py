import os
import re
import shutil
from typing import Dict, List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

# --- CẤU HÌNH ---
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
DATA_ROOT = os.path.join(PROJECT_ROOT, "data_ocr")
DB_PATH = os.path.join(PROJECT_ROOT, "vector_db")

# Ánh xạ grade key → (collection_name, sub_dir)
GRADE_COLLECTION_MAP = {
    "Lop1": ("grade_1_db", "grade_1_db"),
    "Lop2": ("grade_2_db", "grade_2_db"),
    "Lop3": ("grade_3_db", "grade_3_db"),
}

# Các từ khóa nhận diện
KNOWN_PUBLISHERS = ["CanhDieu", "KetNoiTriThuc", "ChanTroiSangTao"]
KNOWN_TYPES = ["SGK", "SGV", "SBT"]

TOPIC_HINTS = [
    ("phep_cong_20", ["cộng", "cong", "thêm", "them", "tổng", "tong"]),
    ("phep_tru_20", ["trừ", "tru", "bớt", "bot", "hiệu", "hieu"]),
    ("hinh_hoc_co_ban", ["hình", "hinh", "tam giác", "vuông", "tròn", "tron", "cạnh", "canh"]),
    ("bang_nhan_2_5", ["bảng nhân", "bang nhan", "gấp", "gap"]),
    ("phep_cong_co_nho_100", ["có nhớ", "co nho", "trong phạm vi 100", "pham vi 100"]),
    ("do_do_dai", ["độ dài", "do dai", "cm", "mét", "met", "thước", "thuoc"]),
    ("dien_tich_hinh_chu_nhat", ["diện tích", "dien tich", "hình chữ nhật", "hinh chu nhat"]),
    ("phep_chia_co_du", ["chia có dư", "chia co du", "số dư", "so du"]),
    ("bai_toan_nhieu_buoc", ["nhiều bước", "nhieu buoc", "bài toán", "bai toan", "sau đó", "sau do"]),
]

OPERATION_BY_TOPIC = {
    "phep_cong_20": "cong",
    "phep_tru_20": "tru",
    "hinh_hoc_co_ban": "hinh_hoc",
    "bang_nhan_2_5": "nhan",
    "phep_cong_co_nho_100": "cong",
    "do_do_dai": "do_luong",
    "dien_tich_hinh_chu_nhat": "hinh_hoc",
    "phep_chia_co_du": "chia",
    "bai_toan_nhieu_buoc": "tong_hop",
}

# -------------------------------------------------------------------
# Problem-Boundary Chunker
# Mỗi chunk = 1 bài toán hoàn chỉnh.
# Cắt TẠI từng marker mới — không gộp, không cắt giữa câu.
# -------------------------------------------------------------------
PROBLEM_MARKER = re.compile(
    r"^(bài\s*\d+|câu\s*\d+|\d+[\).:\-]\s|bước\s*\d+|ví\s*dụ\s*\d*"
    r"|hoạt\s*động|luyện\s*tập|thực\s*hành|bài\s+tập|bài\s+toán)",
    re.IGNORECASE,
)

# Tối đa ~600 tokens (≈ 180 từ tiếng Việt). Bài dài hơn sẽ bị cắt ở ranh giới câu.
MAX_PROBLEM_WORDS = 180


def normalize_extracted_text(text: str) -> str:
    """Làm sạch text trước khi chunk."""
    if not text:
        return ""
    text = text.replace("```", " ")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(line for line in lines if line)
    return text.strip()


def extract_problem_chunks(text: str, metadata: dict) -> List[Document]:
    """
    Mỗi chunk = 1 bài toán hoàn chỉnh.

    Quy tắc:
    1. Cắt TẠI mỗi marker mới (Bài 1, Câu 3, 1., Ví dụ...) — bất kể độ dài block hiện tại.
    2. Bài quá dài (>MAX_PROBLEM_WORDS) → cắt ở ranh giới câu (./!/?), không cắt giữa câu.
    3. KHÔNG gộp nhiều bài vào 1 chunk dù chúng ngắn.
    4. Chunk tối thiểu: 1 câu hoàn chỉnh (dù chỉ 5 từ).
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        return []

    # Bước 1: Tách thành các "problem block" dựa trên marker
    problems: List[str] = []
    current: List[str] = []

    for line in lines:
        if PROBLEM_MARKER.match(line) and current:
            problems.append(" ".join(current))
            current = [line]
        else:
            current.append(line)
    if current:
        problems.append(" ".join(current))

    # Bước 2: Với mỗi problem block, tạo Document(s)
    docs: List[Document] = []
    for i, prob_text in enumerate(problems, start=1):
        prob_text = normalize_extracted_text(prob_text)
        if not prob_text:
            continue

        words = prob_text.split()

        if len(words) <= MAX_PROBLEM_WORDS:
            # Bài vừa đủ → 1 chunk duy nhất
            docs.append(Document(
                page_content=prob_text,
                metadata={
                    **metadata,
                    "problem_index": i,
                    "is_partial": False,
                }
            ))
        else:
            # Bài quá dài → cắt ở ranh giới câu, không bao giờ cắt giữa câu
            sentences = re.split(r'(?<=[.?!])\s+', prob_text)
            chunk_words: List[str] = []
            part = 1

            for sent in sentences:
                candidate = chunk_words + sent.split()
                if len(candidate) > MAX_PROBLEM_WORDS and chunk_words:
                    # Flush chunk hiện tại
                    docs.append(Document(
                        page_content=" ".join(chunk_words),
                        metadata={
                            **metadata,
                            "problem_index": i,
                            "part": part,
                            "is_partial": True,
                        }
                    ))
                    chunk_words = sent.split()
                    part += 1
                else:
                    chunk_words.extend(sent.split())

            # Flush phần cuối
            if chunk_words:
                docs.append(Document(
                    page_content=" ".join(chunk_words),
                    metadata={
                        **metadata,
                        "problem_index": i,
                        "part": part,
                        "is_partial": part > 1,
                    }
                ))

    return docs


def build_reference_docs(documents: List[Document]) -> List[Document]:
    """
    Mỗi chunk = 1 bài toán hoàn chỉnh.
    Không dùng RecursiveTextSplitter hay merge_small_chunks.
    """
    all_docs: List[Document] = []
    for doc in documents:
        all_docs.extend(extract_problem_chunks(doc.page_content, doc.metadata))
    return all_docs


def get_metadata_from_path(file_path: str) -> dict:
    path_parts = file_path.split(os.sep)
    metadata = {
        "grade": "Unknown",
        "publisher": "TongHop",
        "book_type": "TaiLieuKhac",
    }
    # 1. Tìm Lớp
    for part in path_parts:
        if part.startswith("Lop") and part[3:].isdigit():
            metadata["grade"] = part
            break
    # 2. Tìm NXB
    for pub in KNOWN_PUBLISHERS:
        if pub in path_parts:
            metadata["publisher"] = pub
            break
    # 3. Tìm Loại sách
    for b_type in KNOWN_TYPES:
        if b_type in path_parts:
            metadata["book_type"] = b_type
            break
    return metadata


def infer_pedagogical_metadata(text: str, source_name: str) -> dict:
    """Infer pedagogical metadata for template-first retrieval."""
    raw = f"{source_name} {text}".lower()

    topic_slug = "tong_hop"
    for slug, keywords in TOPIC_HINTS:
        if any(keyword in raw for keyword in keywords):
            topic_slug = slug
            break

    representation = "abstract"
    if any(keyword in raw for keyword in ["hình", "hinh", "sơ đồ", "so do", "vẽ", "ve"]):
        representation = "pictorial"
    elif any(keyword in raw for keyword in ["quả", "qua", "kẹo", "keo", "con", "bạn", "ban"]):
        representation = "concrete"

    template_type = "loi_van"
    if any(keyword in raw for keyword in ["điền", "dien", "điền số", "dien so"]):
        template_type = "dien_so"
    elif any(keyword in raw for keyword in ["nhìn hình", "nhin hinh", "khoanh", "nối", "noi"]):
        template_type = "nhan_dien_mau"
    elif any(keyword in raw for keyword in ["tính", "tinh", "đặt tính", "dat tinh"]):
        template_type = "tinh_truc_tiep"

    skill = "nhan_biet"
    if any(keyword in raw for keyword in ["vì sao", "vi sao", "giải thích", "giai thich", "lập luận", "lap luan"]):
        skill = "suy_luan"
    elif any(keyword in raw for keyword in ["2 bước", "2 buoc", "3 bước", "3 buoc"]):
        skill = "loi_van_2_buoc"
    elif "bài toán" in raw or "bai toan" in raw:
        skill = "loi_van_1_buoc"

    difficulty_band = "foundation"
    if any(keyword in raw for keyword in ["nâng cao", "nang cao", "vận dụng cao", "van dung cao"]):
        difficulty_band = "advanced"
    elif any(keyword in raw for keyword in ["vận dụng", "van dung"]):
        difficulty_band = "extension"
    elif any(keyword in raw for keyword in ["thông hiểu", "thong hieu"]):
        difficulty_band = "standard"

    answer_type = "so"
    if "hinh_hoc" in OPERATION_BY_TOPIC.get(topic_slug, ""):
        answer_type = "ten_hinh"
    elif "do_luong" == OPERATION_BY_TOPIC.get(topic_slug):
        answer_type = "don_vi"

    return {
        "topic_slug": topic_slug,
        "subtopic": topic_slug,
        "skill": skill,
        "representation": representation,
        "operation": OPERATION_BY_TOPIC.get(topic_slug, "tong_hop"),
        "answer_type": answer_type,
        "template_type": template_type,
        "difficulty_band": difficulty_band,
    }


def ingest_data():
    print("🚀 Bắt đầu nạp dữ liệu (Problem-Boundary Chunker + Per-Grade Collections)...")

    if not os.path.exists(DATA_ROOT):
        print(f"❌ Lỗi: Không tìm thấy thư mục '{DATA_ROOT}'")
        return

    # Thử import pymupdf4llm
    try:
        import pymupdf4llm
        use_llm_extractor = True
        print("✅ Sử dụng pymupdf4llm cho text extraction")
    except ImportError:
        use_llm_extractor = False
        print("⚠️ pymupdf4llm không có, sử dụng fitz trực tiếp")

    # --- Bước 1: Đọc tất cả PDF, nhóm theo grade ---
    raw_docs_by_grade: Dict[str, List[Document]] = {g: [] for g in GRADE_COLLECTION_MAP}
    total_files = 0

    for root, dirs, files in os.walk(DATA_ROOT):
        for filename in files:
            if not filename.endswith(".pdf"):
                continue

            file_path = os.path.join(root, filename)
            meta = get_metadata_from_path(file_path)

            if meta["grade"] not in GRADE_COLLECTION_MAP:
                print(f"⏭️  Bỏ qua (grade không xác định): {filename}")
                continue

            try:
                print(f"📖 {filename} | {meta['grade']} - {meta['publisher']} - {meta['book_type']}")

                if use_llm_extractor:
                    md_text = pymupdf4llm.to_markdown(file_path)
                    if isinstance(md_text, str):
                        extracted = md_text
                    else:
                        extracted = "\n".join([str(item) for item in md_text])
                    normalized = normalize_extracted_text(extracted)
                    if normalized:
                        pedagogical = infer_pedagogical_metadata(normalized, filename)
                        raw_docs_by_grade[meta["grade"]].append(Document(
                            page_content=normalized,
                            metadata={**meta, **pedagogical, "source_file": filename},
                        ))
                else:
                    import fitz
                    doc = fitz.open(file_path)
                    for page_num in range(doc.page_count):
                        page = doc.load_page(page_num)
                        text_raw = page.get_text()
                        if isinstance(text_raw, str):
                            text = text_raw
                        else:
                            text = str(text_raw)

                        if text.strip():
                            cleaned = text.replace("\n", " ").strip()
                            pedagogical = infer_pedagogical_metadata(cleaned, filename)
                            raw_docs_by_grade[meta["grade"]].append(Document(
                                page_content=cleaned,
                                metadata={**meta, **pedagogical, "source_file": filename, "page": page_num + 1},
                            ))
                    doc.close()

                total_files += 1
            except Exception as e:
                print(f"⚠️  Lỗi file {filename}: {e}")

    print(f"\n📊 Thống kê đọc file:")
    print(f"   - Files đọc: {total_files}")
    for grade, docs in raw_docs_by_grade.items():
        print(f"   - {grade}: {len(docs)} tài liệu thô")

    # --- Bước 2: Chunk theo Problem Boundary ---
    print("\n📦 Đang chunk theo Problem Boundary (1 chunk = 1 bài toán)...")
    chunks_by_grade: Dict[str, List[Document]] = {}

    for grade_key, docs in raw_docs_by_grade.items():
        if not docs:
            print(f"   ⏭️  {grade_key}: không có tài liệu, bỏ qua")
            continue
        chunks = build_reference_docs(docs)
        chunks_by_grade[grade_key] = chunks
        partial = sum(1 for c in chunks if c.metadata.get("is_partial", False))
        print(f"   ✅ {grade_key}: {len(chunks)} chunks "
              f"({len(chunks) - partial} bài hoàn chỉnh, {partial} phần bài dài)")

    total_chunks = sum(len(v) for v in chunks_by_grade.values())
    if total_chunks == 0:
        print("❌ Không có chunks nào được tạo.")
        return

    # --- Bước 3: Tải Embedding Model ---
    print("\n🧠 Đang tải model 'keepitreal/vietnamese-sbert'...")
    embedding_model = HuggingFaceEmbeddings(
        model_name="keepitreal/vietnamese-sbert",
        model_kwargs={"device": "cpu"},
    )

    # --- Bước 4: Lưu từng collection riêng biệt ---
    print("\n💾 Đang lưu vào ChromaDB (3 collections riêng biệt)...")

    for grade_key, (collection_name, sub_dir) in GRADE_COLLECTION_MAP.items():
        grade_chunks = chunks_by_grade.get(grade_key, [])
        persist_dir = os.path.join(DB_PATH, sub_dir)

        if not grade_chunks:
            print(f"   ⏭️  {grade_key}: không có chunk, bỏ qua collection '{collection_name}'")
            continue

        # Xóa collection cũ của lớp này (nếu có)
        if os.path.exists(persist_dir):
            shutil.rmtree(persist_dir)
            print(f"   🗑️  Đã xóa collection cũ: {sub_dir}/")

        Chroma.from_documents(
            grade_chunks,
            embedding_model,
            persist_directory=persist_dir,
            collection_name=collection_name,
        )
        print(f"   ✅ {grade_key} → '{collection_name}': {len(grade_chunks)} chunks đã lưu")

    print(f"\n🎉 XONG! Tổng: {total_chunks} chunks trong 3 collections")
    print(f"   📁 Vị trí: {DB_PATH}/")
    print(f"   ├── grade_1_db/")
    print(f"   ├── grade_2_db/")
    print(f"   └── grade_3_db/")
    print("\n⚠️  Lưu ý: Collection cũ (chroma.sqlite3 ở root vector_db) không bị xóa tự động.")
    print("   Sau khi xác nhận 3 collections mới hoạt động, bạn có thể xóa thủ công.")


if __name__ == "__main__":
    ingest_data()