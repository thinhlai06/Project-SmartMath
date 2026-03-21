"""
RAG Service - Retrieves relevant context from ChromaDB using vietnamese-sbert embeddings.
Uses lazy initialization so the server starts even without the model downloaded.
"""
import logging
import os

logger = logging.getLogger(__name__)

# Path configuration
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
DB_PATH = os.path.join(PROJECT_ROOT, "vector_db")


class RAGService:
    """Retrieves relevant SGK/SGV context using the vietnamese-sbert embedding model.

    Initialization is lazy: the HuggingFace model is only downloaded / loaded
    the first time *retrieve()* is called, not when the service is instantiated.
    This prevents the FastAPI startup from blocking while Torch / sentence-
    transformers are initialised.
    """

    _instance = None
    _embedding_model = None
    _db = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    # __init__ intentionally left empty – see _lazy_init()
    def __init__(self):
        pass

    def _lazy_init(self):
        """Load embedding model and ChromaDB on first use."""
        if RAGService._initialized:
            return

        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            from langchain_community.vectorstores import Chroma

            logger.info("🔄 Initializing RAG Service with DB at: %s", DB_PATH)
            RAGService._embedding_model = HuggingFaceEmbeddings(
                model_name="keepitreal/vietnamese-sbert",
                model_kwargs={"device": "cpu"},
            )
            RAGService._db = Chroma(
                persist_directory=DB_PATH,
                embedding_function=RAGService._embedding_model,
            )
            RAGService._initialized = True
            logger.info("✅ RAG Service initialized successfully")
        except Exception as e:
            logger.warning("⚠️ RAG Service could not initialize: %s. Continuing without RAG.", e)
            RAGService._initialized = True  # mark as attempted so we don't retry every call

    def is_available(self) -> bool:
        """Return True if the vector DB is loaded and has data."""
        self._lazy_init()
        if RAGService._db is None:
            return False
        try:
            count = RAGService._db._collection.count()
            return count > 0
        except Exception:
            return False

    def retrieve(self, query: str, grade: int = None, k: int = 5) -> list:
        """Retrieve relevant chunks from SGK/SGV.

        Returns an empty list (instead of raising) when the service is not
        available or the vector DB contains no documents.
        """
        self._lazy_init()
        if RAGService._db is None:
            logger.info("RAG not available – skipping retrieval for query: %s", query[:50])
            return []

        try:
            filter_dict = None
            if grade:
                grade_str = f"Lop{grade}"
                filter_dict = {"grade": grade_str}

            # Check collection size before querying to avoid Chroma error
            count = RAGService._db._collection.count()
            if count == 0:
                logger.info("Vector DB is empty – skipping RAG retrieval")
                return []

            logger.info("🔍 RAG: '%s...' | Grade: %s", query[:50], grade)
            results = RAGService._db.similarity_search(
                query,
                k=min(k, count),
                filter=filter_dict,
            )
            return results
        except Exception as e:
            logger.warning("RAG retrieval failed: %s", e)
            return []
