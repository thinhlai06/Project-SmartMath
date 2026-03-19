from __future__ import annotations

from sqlalchemy.orm import Session

from app.domain.repositories.topic_repository import TopicRepository
from app.models.math_topic import MathTopic


class SqlAlchemyTopicRepository(TopicRepository):
    """SQLAlchemy implementation of TopicRepository port."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, topic_id: int):
        return self.db.query(MathTopic).filter(MathTopic.id == topic_id).first()
