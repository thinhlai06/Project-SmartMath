import os
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
                            # Sử dụng pymupdf4llm để extract markdown (tốt hơn cho LLM)
                            md_text = pymupdf4llm.to_markdown(file_path)
                            
                            if md_text and md_text.strip():
                                # Chia nhỏ theo sections
                                sections = md_text.split('\n\n')
                                for i, section in enumerate(sections):
                                    section = section.strip()
                                    if len(section) > 50:  # Bỏ qua sections quá ngắn
                                        doc_obj = Document(
                                            page_content=section,
                                            metadata={
                                                **meta,
                                                'source_file': filename,
                                                'section': i + 1
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

    # --- SỬ DỤNG CLASS TỪ GÓI MỚI ---
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"🧩 Số lượng chunks: {len(chunks)}")

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