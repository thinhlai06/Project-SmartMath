from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.domain.repositories.worksheet_repository import WorksheetRepository
from app.models.worksheet import Worksheet, WorksheetStatus


class SqlAlchemyWorksheetRepository(WorksheetRepository):
    """SQLAlchemy implementation of worksheet repository port."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, worksheet_id: int) -> Optional[Worksheet]:
        return self.db.query(Worksheet).filter(Worksheet.id == worksheet_id).first()

    def publish(self, worksheet: Worksheet) -> Worksheet:
        setattr(worksheet, "status", WorksheetStatus.PUBLISHED)
        setattr(worksheet, "published_at", datetime.utcnow())
        self.db.commit()
        self.db.refresh(worksheet)
        return worksheet
