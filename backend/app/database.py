from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine
import sqlite3
from app.config import settings

# Enable SQLite FK enforcement (required for ondelete="CASCADE" to work)
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# SQLite database configuration
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite
)


def _ensure_sqlite_schema_compatibility() -> None:
    """Apply minimal, safe schema fixes for existing SQLite databases.

    This keeps refactors backward-compatible on developer machines where the
    database file predates recent model changes.
    """
    if not settings.DATABASE_URL.startswith("sqlite"):
        return

    with engine.begin() as conn:
        table_check = conn.exec_driver_sql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='student_progress'"
        ).fetchone()
        if not table_check:
            return

        columns = conn.exec_driver_sql("PRAGMA table_info(student_progress)").fetchall()
        column_names = {row[1] for row in columns}

        if "updated_at" not in column_names:
            conn.exec_driver_sql("ALTER TABLE student_progress ADD COLUMN updated_at DATETIME")
            conn.exec_driver_sql(
                "UPDATE student_progress SET updated_at = created_at WHERE updated_at IS NULL"
            )


_ensure_sqlite_schema_compatibility()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
