from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Announcement(Base):
    """Announcement model for class notifications."""
    
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("math_classes.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    math_class = relationship("MathClass", back_populates="announcements")

    def __repr__(self):
        return f"<Announcement(id={self.id}, title='{self.title}')>"
