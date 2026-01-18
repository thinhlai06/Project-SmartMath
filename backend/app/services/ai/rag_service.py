"""
RAG Service - Retrieves relevant context from ChromaDB using vietnamese-sbert embeddings.
"""
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import os

# Path configuration
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
DB_PATH = os.path.join(PROJECT_ROOT, "vector_db")


class RAGService:
    _instance = None
    _embedding_model = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if RAGService._db is None:
            print(f"🔄 Initializing RAG Service with DB at: {DB_PATH}")
            RAGService._embedding_model = HuggingFaceEmbeddings(
                model_name="keepitreal/vietnamese-sbert",
                model_kwargs={'device': 'cpu'}
            )
            RAGService._db = Chroma(
                persist_directory=DB_PATH,
                embedding_function=RAGService._embedding_model
            )

    def retrieve(self, query: str, grade: int = None, k: int = 5) -> list:
        """Retrieve relevant chunks from SGK/SGV."""
        filter_dict = None
        if grade:
            grade_str = f"Lop{grade}"
            filter_dict = {"grade": grade_str}

        print(f"🔍 RAG: '{query[:50]}...' | Grade: {grade}")
        results = RAGService._db.similarity_search(
            query,
            k=k,
            filter=filter_dict
        )
        return results
