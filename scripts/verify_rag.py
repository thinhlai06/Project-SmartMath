"""
verify_rag.py - Kiểm tra 3 ChromaDB collections sau khi chạy ingest.py.

Cách dùng:
    python scripts/verify_rag.py
"""
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
DB_PATH = os.path.join(PROJECT_ROOT, "vector_db")

GRADE_COLLECTION_MAP = {
    1: ("grade_1_db", "grade_1_db"),
    2: ("grade_2_db", "grade_2_db"),
    3: ("grade_3_db", "grade_3_db"),
}

TEST_QUERIES = {
    1: "phép cộng trong phạm vi 10",
    2: "bảng nhân 2 bài toán có lời văn",
    3: "bài toán giải hai bước nhân chia",
}


def main():
    print("=" * 60)
    print("🔍 RAG Collection Verification")
    print("=" * 60)

    try:
        from langchain_huggingface import HuggingFaceEmbeddings
        from langchain_community.vectorstores import Chroma
    except ImportError as e:
        print(f"❌ Thiếu thư viện: {e}")
        sys.exit(1)

    print("🧠 Đang tải embedding model...")
    embedding = HuggingFaceEmbeddings(
        model_name="keepitreal/vietnamese-sbert",
        model_kwargs={"device": "cpu"},
    )
    print("✅ Model sẵn sàng.\n")

    all_ok = True

    for grade, (collection_name, sub_dir) in GRADE_COLLECTION_MAP.items():
        persist_dir = os.path.join(DB_PATH, sub_dir)
        print(f"{'─' * 50}")
        print(f"📚 Grade {grade} → collection '{collection_name}'")
        print(f"   Path: {persist_dir}")

        if not os.path.exists(persist_dir):
            print(f"   ❌ Thư mục không tồn tại! Hãy chạy ingest.py trước.")
            all_ok = False
            continue

        try:
            db = Chroma(
                persist_directory=persist_dir,
                collection_name=collection_name,
                embedding_function=embedding,
            )
            count = db._collection.count()
            print(f"   📦 Tổng chunks: {count}")

            if count == 0:
                print(f"   ⚠️  Collection rỗng!")
                all_ok = False
                continue

            # Kiểm tra grade metadata
            print(f"   🔬 Kiểm tra metadata grade (top 5 docs)...")
            results = db._collection.get(limit=5, include=["metadatas"])
            grades_found = set()
            for meta in results.get("metadatas", []):
                grades_found.add(meta.get("grade", "UNKNOWN"))
            expected = f"Lop{grade}"
            if grades_found - {expected}:
                print(f"   ⚠️  Phát hiện grade sai trong collection: {grades_found}")
                all_ok = False
            else:
                print(f"   ✅ Metadata grade đúng: {grades_found}")

            # Thử query
            query = TEST_QUERIES[grade]
            print(f"   🔍 Query thử: '{query}'")
            hits = db.similarity_search(query, k=3)
            for i, doc in enumerate(hits, 1):
                snippet = doc.page_content[:120].replace("\n", " ")
                meta = doc.metadata
                print(f"      [{i}] grade={meta.get('grade')} | src={meta.get('source_file','?')} | partial={meta.get('is_partial','?')}")
                print(f"           \"{snippet}...\"")

        except Exception as e:
            print(f"   ❌ Lỗi: {e}")
            all_ok = False

    print(f"\n{'=' * 60}")
    if all_ok:
        print("🎉 Tất cả collections OK! RAG sẵn sàng hoạt động.")
    else:
        print("⚠️  Một số collections có vấn đề. Kiểm tra log ở trên.")
    print("=" * 60)


if __name__ == "__main__":
    main()
