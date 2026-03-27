import os
import re
import shutil
# --- SỬA LỖI: Dùng thư viện mới langchain_text_splitters ---
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

# --- CẤU HÌNH ---
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
DATA_ROOT = os.path.join(PROJECT_ROOT, "data_raw")
DB_PATH = os.path.join(PROJECT_ROOT, "vector_db")

# Các từ khóa nhận diện
KNOWN_PUBLISHERS = ["CanhDieu", "KetNoiTriThuc", "ChanTroiSangTao"]
KNOWN_TYPES = ["SGK", "SGV", "SBT"]

# Marker mở đầu một bài/ý mới trong SGK-SBT-SGV.
SEMANTIC_MARKER_PATTERN = re.compile(
    r"^(bài\s*\d+|bài\s+tập|ví\s*dụ|hoạt\s*động|luyện\s*tập|thực\s*hành|câu\s*\d+|\d+[\).:]|bước\s*\d+)",
    re.IGNORECASE,
)


def normalize_extracted_text(text: str) -> str:
    """Normalize extracted markdown/text before chunking."""
    if not text:
        return ""

    # Remove markdown fences that create noisy standalone chunks.
    text = text.replace("```", " ")

    # Keep paragraph boundaries but normalize repeated whitespace.
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(line for line in lines if line)
    return text.strip()


def merge_small_chunks(chunks, min_words=60, target_words=180):
    """Merge consecutive small chunks from the same source into richer context blocks."""
    merged = []
    buffer_text = ""
    buffer_meta = None

    def flush_buffer():
        nonlocal buffer_text, buffer_meta
        if buffer_text and buffer_meta:
            merged.append(Document(page_content=buffer_text.strip(), metadata=buffer_meta))
        buffer_text = ""
        buffer_meta = None

    for chunk in chunks:
        text = normalize_extracted_text(chunk.page_content)
        if not text:
            continue

        words = len(text.split())
        same_source = (
            buffer_meta is not None
            and chunk.metadata.get("source_file") == buffer_meta.get("source_file")
            and chunk.metadata.get("grade") == buffer_meta.get("grade")
            and chunk.metadata.get("publisher") == buffer_meta.get("publisher")
            and chunk.metadata.get("book_type") == buffer_meta.get("book_type")
            and chunk.metadata.get("semantic_block") == buffer_meta.get("semantic_block")
        )

        if buffer_text:
            # If the buffer is still short and we are in the same source, keep aggregating.
            if len(buffer_text.split()) < min_words and same_source:
                buffer_text = f"{buffer_text}\n{text}"
                if len(buffer_text.split()) >= target_words:
                    flush_buffer()
                continue

            flush_buffer()

        if words < min_words:
            buffer_text = text
            buffer_meta = dict(chunk.metadata)
        else:
            merged.append(Document(page_content=text, metadata=chunk.metadata))

    flush_buffer()
    return merged

def get_metadata_from_path(file_path):
    path_parts = file_path.split(os.sep)
    metadata = {
        "grade": "Unknown",
        "publisher": "TongHop",
        "book_type": "TaiLieuKhac"
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


def split_into_semantic_blocks(text: str, min_words_per_block=90):
    """Split text into exercise-aware semantic blocks.

    We start a new block when typical exercise markers appear. This helps keep
    full problem statements together before technical chunking.
    """
    if not text:
        return []

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        return []

    blocks = []
    current = []

    def word_count(parts):
        return len(" ".join(parts).split())

    for line in lines:
        is_marker = bool(SEMANTIC_MARKER_PATTERN.match(line.lower()))
        if is_marker and current and word_count(current) >= min_words_per_block:
            blocks.append("\n".join(current).strip())
            current = [line]
            continue

        current.append(line)

    if current:
        blocks.append("\n".join(current).strip())

    return blocks


def build_reference_docs(documents):
    """Build reference-friendly docs that preserve full exercise context."""
    semantic_docs = []

    for doc in documents:
        blocks = split_into_semantic_blocks(doc.page_content, min_words_per_block=90)
        if not blocks:
            blocks = [doc.page_content]

        for idx, block in enumerate(blocks, start=1):
            block_text = normalize_extracted_text(block)
            if not block_text:
                continue

            semantic_docs.append(
                Document(
                    page_content=block_text,
                    metadata={
                        **doc.metadata,
                        "semantic_block": idx,
                    },
                )
            )

    # Only split oversized blocks to avoid breaking full exercises unnecessarily.
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=2200,
        chunk_overlap=350,
        separators=["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " ", ""],
    )

    split_docs = []
    for doc in semantic_docs:
        if len(doc.page_content.split()) > 360:
            split_docs.extend(splitter.split_documents([doc]))
        else:
            split_docs.append(doc)

    # Merge any remaining fragments that are too small.
    return merge_small_chunks(split_docs, min_words=100, target_words=220)

def ingest_data():
    print("🚀 Bắt đầu nạp dữ liệu (Version: pymupdf4llm)...")
    
    if not os.path.exists(DATA_ROOT):
        print(f"❌ Lỗi: Không tìm thấy thư mục '{DATA_ROOT}'")
        return

    documents = []
    total_files = 0
    total_pages_with_text = 0

    # Thử import pymupdf4llm
    try:
        import pymupdf4llm
        use_llm_extractor = True
        print("✅ Sử dụng pymupdf4llm cho text extraction")
    except ImportError:
        use_llm_extractor = False
        print("⚠️ pymupdf4llm không có, sử dụng fitz trực tiếp")

    # Quét file bằng os.walk (bất chấp cấu trúc thư mục)
    for root, dirs, files in os.walk(DATA_ROOT):
        for filename in files:
            if filename.endswith(".pdf"):
                file_path = os.path.join(root, filename)
                meta = get_metadata_from_path(file_path)
                
                if meta["grade"] != "Unknown":
                    try:
                        print(f"📖 Đọc: {filename} \t| {meta['grade']} - {meta['publisher']} - {meta['book_type']}")
                        
                        if use_llm_extractor:
                            # Sử dụng pymupdf4llm để extract markdown (tốt hơn cho LLM).
                            # Quan trọng: không chia nhỏ sớm theo section để tránh tạo chunk quá ngắn.
                            md_text = pymupdf4llm.to_markdown(file_path)

                            normalized_text = normalize_extracted_text(md_text)
                            if normalized_text:
                                doc_obj = Document(
                                    page_content=normalized_text,
                                    metadata={
                                        **meta,
                                        'source_file': filename,
                                        'section': 1
                                    }
                                )
                                documents.append(doc_obj)
                                total_pages_with_text += 1
                        else:
                            # Fallback: dùng fitz trực tiếp
                            import fitz
                            doc = fitz.open(file_path)
                            
                            for page_num, page in enumerate(doc):
                                text = page.get_text()
                                
                                if text and text.strip():
                                    doc_obj = Document(
                                        page_content=text.replace('\n', ' ').strip(),
                                        metadata={
                                            **meta,
                                            'source_file': filename,
                                            'page': page_num + 1
                                        }
                                    )
                                    documents.append(doc_obj)
                                    total_pages_with_text += 1
                            
                            doc.close()
                        
                        total_files += 1
                        print(f"   → Documents so far: {len(documents)}")
                    except Exception as e:
                        print(f"⚠️ Lỗi file {filename}: {e}")

    print(f"\n📊 Thống kê:")
    print(f"   - Files đọc: {total_files}")
    print(f"   - Documents tạo: {len(documents)}")

    if len(documents) == 0:
        print("❌ Không có document nào được tạo. PDFs có thể là dạng ảnh scan.")
        print("💡 Gợi ý: Cần sử dụng OCR để extract text từ ảnh.")
        return

    print(f"\n📦 Đang chia nhỏ {len(documents)} documents...")

    chunks = build_reference_docs(documents)
    print(f"✅ Chunks semantic cho reference: {len(chunks)}")

    if len(chunks) == 0:
        print("❌ Không có chunks nào được tạo.")
        return

    # --- XÁC NHẬN: ĐÃ SỬ DỤNG MODEL BẠN YÊU CẦU ---
    print("🧠 Đang tải Model 'keepitreal/vietnamese-sbert'...")
    embedding_model = HuggingFaceEmbeddings(
        model_name="keepitreal/vietnamese-sbert", # <--- Chính xác là model này
        model_kwargs={'device': 'cpu'}
    )

    if os.path.exists(DB_PATH):
        shutil.rmtree(DB_PATH) # Xóa DB cũ để làm sạch
        print("🗑️  Đã xóa DB cũ.")

    print("💾 Đang lưu vào ChromaDB...")
    db = Chroma.from_documents(chunks, embedding_model, persist_directory=DB_PATH)
    print(f"🎉 XONG! Dữ liệu đã lưu tại: {DB_PATH}")
    print(f"   - Tổng chunks: {len(chunks)}")

if __name__ == "__main__":
    ingest_data()