import os
import shutil
# --- SỬA LỖI: Dùng thư viện mới langchain_text_splitters ---
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

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
    print("🚀 Bắt đầu nạp dữ liệu (Phiên bản đã sửa lỗi import)...")
    
    if not os.path.exists(DATA_ROOT):
        print(f"❌ Lỗi: Không tìm thấy thư mục '{DATA_ROOT}'")
        return

    documents = []
    total_files = 0

    # Quét file bằng os.walk (bất chấp cấu trúc thư mục)
    for root, dirs, files in os.walk(DATA_ROOT):
        for filename in files:
            if filename.endswith(".pdf"):
                file_path = os.path.join(root, filename)
                meta = get_metadata_from_path(file_path)
                
                if meta["grade"] != "Unknown":
                    try:
                        print(f"📖 Đọc: {filename} \t| {meta['grade']} - {meta['publisher']} - {meta['book_type']}")
                        loader = PyPDFLoader(file_path)
                        pages = loader.load()
                        
                        for page in pages:
                            page.metadata.update(meta)
                            page.metadata['source_file'] = filename
                            if page.page_content:
                                page.page_content = page.page_content.replace('\n', ' ')
                        
                        documents.extend(pages)
                        total_files += 1
                    except Exception as e:
                        print(f"⚠️ Lỗi file {filename}: {e}")

    if total_files == 0:
        print("❌ Không tìm thấy file PDF nào hợp lệ.")
        return

    print(f"\n📦 Tổng: {total_files} file. Đang chia nhỏ...")

    # --- SỬ DỤNG CLASS TỪ GÓI MỚI ---
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"🧩 Số lượng chunks: {len(chunks)}")

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

if __name__ == "__main__":
    ingest_data()