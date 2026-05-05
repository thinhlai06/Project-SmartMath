from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class ChatMessage(Base):
    """Persist chat messages between teacher and AI chatbot."""

    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_id = Column(String(64), nullable=False, index=True)
    role = Column(String(10), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    message_type = Column(String(30), default="text")
    context_metadata = Column("metadata_json", JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    teacher = relationship("User")
