"""
RAG Service - Retrieves relevant context from per-grade ChromaDB collections.

Architecture:
  - grade_1_db  →  collection "grade_1_db"
  - grade_2_db  →  collection "grade_2_db"
  - grade_3_db  →  collection "grade_3_db"

Each grade's Chroma connection is lazy-loaded on first use and cached for the
lifetime of the server. Switching between grades is safe: all three connections
can coexist simultaneously in _dbs without interfering with each other.
"""
import logging
import os
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

# Path configuration
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
DB_PATH = os.path.join(PROJECT_ROOT, "vector_db")

# Ánh xạ grade int → (collection_name, sub_dir)
GRADE_COLLECTION_MAP: Dict[int, tuple] = {
    1: ("grade_1_db", "grade_1_db"),
    2: ("grade_2_db", "grade_2_db"),
    3: ("grade_3_db", "grade_3_db"),
}


class RAGService:
    """
    Retrieves relevant SGK/SGV context from per-grade ChromaDB collections.

    Lazy-load:
    - Embedding model: loaded once on first retrieve() call.
    - Per-grade Chroma: loaded on first retrieve() call for that grade.
      Subsequent calls for the same grade reuse the cached connection instantly.

    Switching grades (e.g. grade 1 → grade 3 → grade 1) is fully safe:
    all connections accumulate in _dbs and never overwrite each other.
    """

    _instance = None
    _embedding_model = None
    _dbs: Dict[int, Any] = {}   # grade_int → Chroma object
    _model_initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        pass  # lazy init only

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _init_embedding_model(self):
        """Load embedding model once. Thread-safe for read-mostly workloads."""
        if RAGService._model_initialized:
            return

        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            logger.info("🔄 Loading vietnamese-sbert embedding model...")
            RAGService._embedding_model = HuggingFaceEmbeddings(
                model_name="keepitreal/vietnamese-sbert",
                model_kwargs={"device": "cpu"},
            )
            RAGService._model_initialized = True
            logger.info("✅ Embedding model loaded.")
        except Exception as e:
            logger.warning("⚠️ Could not load embedding model: %s. RAG will be disabled.", e)
            RAGService._model_initialized = True  # mark attempted, don't retry

    def _get_db_for_grade(self, grade: Optional[int]):
        """
        Return the Chroma collection for the given grade.
        Loads it from disk on the first call; returns cached object on subsequent calls.
        Returns None if the collection directory does not exist.
        """
        if grade is None:
            return None

        if grade in RAGService._dbs:
            return RAGService._dbs[grade]  # already loaded — instant return

        if RAGService._embedding_model is None:
            return None

        collection_info = GRADE_COLLECTION_MAP.get(grade)
        if collection_info is None:
            logger.warning("RAGService: unknown grade %s", grade)
            return None

        collection_name, sub_dir = collection_info
        persist_dir = os.path.join(DB_PATH, sub_dir)

        if not os.path.exists(persist_dir):
            logger.info(
                "RAGService: collection '%s' not found at %s. Run ingest.py first.",
                collection_name, persist_dir
            )
            return None

        try:
            from langchain_community.vectorstores import Chroma
            logger.info("🔄 Loading collection '%s' for grade %s...", collection_name, grade)
            db = Chroma(
                persist_directory=persist_dir,
                collection_name=collection_name,
                embedding_function=RAGService._embedding_model,
            )
            RAGService._dbs[grade] = db
            count = db._collection.count()
            logger.info("✅ Grade %s collection loaded: %d chunks.", grade, count)
            return db
        except Exception as e:
            logger.warning("⚠️ Failed to load collection for grade %s: %s", grade, e)
            return None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def is_available(self, grade: int = None) -> bool:
        """
        Return True if at least one collection (or the specified grade's collection)
        is loaded and contains data.
        """
        self._init_embedding_model()

        if grade is not None:
            db = self._get_db_for_grade(grade)
            if db is None:
                return False
            try:
                return db._collection.count() > 0
            except Exception:
                return False

        # Check any grade
        for g in GRADE_COLLECTION_MAP:
            if self.is_available(grade=g):
                return True
        return False

    def retrieve(self, query: str, grade: Optional[int] = None, k: int = 5) -> list:
        """
        Retrieve relevant chunks from the collection of the specified grade.

        STRICT: only queries the collection of that grade.
        Returns [] if grade is invalid, collection missing, or error occurs.
        """
        self._init_embedding_model()

        if RAGService._embedding_model is None:
            logger.info("RAG disabled (embedding model not available).")
            return []

        if grade not in GRADE_COLLECTION_MAP:
            logger.warning(
                "RAGService.retrieve: grade=%s is not valid (must be 1, 2, or 3). "
                "Skipping retrieval.", grade
            )
            return []

        db = self._get_db_for_grade(grade)
        if db is None:
            logger.info("RAGService: no collection for grade %s. Skipping.", grade)
            return []

        try:
            count = db._collection.count()
            if count == 0:
                logger.info("Grade %s collection is empty.", grade)
                return []

            logger.info("🔍 RAG grade=%s | query='%s...' | k=%d", grade, query[:50], k)
            results = db.similarity_search(query, k=min(k, count))
            # Safety: discard any doc that somehow has a mismatched grade in metadata
            expected_grade = f"Lop{grade}"
            safe_results = [
                d for d in results
                if d.metadata.get("grade", expected_grade) == expected_grade
            ]
            if len(safe_results) < len(results):
                logger.warning(
                    "RAGService: discarded %d docs with mismatched grade metadata.",
                    len(results) - len(safe_results)
                )
            return safe_results
        except Exception as e:
            logger.warning("RAG retrieval failed for grade %s: %s", grade, e)
            return []

    def retrieve_with_filter(
        self,
        query: str,
        grade: Optional[int] = None,
        k: int = 5,
        metadata_filter: Optional[Dict[str, Any]] = None,
        allow_filter_fallback: bool = True,
    ) -> list:
        """
        Retrieve chunks with optional metadata filtering.

        The filter is applied inside the selected grade collection only.
        If filter returns no rows and allow_filter_fallback=True, it retries
        without metadata filter while still constrained to the grade DB.
        """
        self._init_embedding_model()

        if RAGService._embedding_model is None:
            logger.info("RAG disabled (embedding model not available).")
            return []

        if grade not in GRADE_COLLECTION_MAP:
            logger.warning(
                "RAGService.retrieve_with_filter: grade=%s is not valid (must be 1, 2, or 3).",
                grade,
            )
            return []

        db = self._get_db_for_grade(grade)
        if db is None:
            logger.info("RAGService: no collection for grade %s. Skipping.", grade)
            return []

        active_filter: Dict[str, Any] = {}
        if metadata_filter:
            active_filter = {k: v for k, v in metadata_filter.items() if v not in (None, "", [], {})}

        try:
            count = db._collection.count()
            if count == 0:
                logger.info("Grade %s collection is empty.", grade)
                return []

            logger.info(
                "🔍 RAG filtered grade=%s | query='%s...' | k=%d | filter=%s",
                grade,
                query[:50],
                k,
                active_filter,
            )

            if active_filter:
                results = db.similarity_search(query, k=min(k, count), filter=active_filter)
            else:
                results = db.similarity_search(query, k=min(k, count))

            if not results and active_filter and allow_filter_fallback:
                logger.info("RAG filtered retrieval empty. Falling back to grade-only retrieval.")
                results = db.similarity_search(query, k=min(k, count))

            expected_grade = f"Lop{grade}"
            safe_results = [
                d for d in results
                if d.metadata.get("grade", expected_grade) == expected_grade
            ]
            if len(safe_results) < len(results):
                logger.warning(
                    "RAGService: discarded %d docs with mismatched grade metadata.",
                    len(results) - len(safe_results)
                )
            return safe_results
        except Exception as e:
            logger.warning("Filtered RAG retrieval failed for grade %s: %s", grade, e)
            return []
