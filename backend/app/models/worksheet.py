from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class WorksheetStatus(str, enum.Enum):
    """Worksheet publication status."""
    DRAFT = "draft"
    PUBLISHED = "published"


class WorksheetType(str, enum.Enum):
    """Type of worksheet."""
    CPA = "cpa"
    DIFFERENTIATION = "differentiation"


class Worksheet(Base):
    """Worksheet model containing exercises."""
    
    __tablename__ = "worksheets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    class_id = Column(Integer, ForeignKey("math_classes.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("math_topics.id"), nullable=True)
    grade = Column(Integer, nullable=False)
    difficulty = Column(String(50), nullable=True)
    status = Column(SQLEnum(WorksheetStatus), default=WorksheetStatus.DRAFT)
    worksheet_type = Column(SQLEnum(WorksheetType), nullable=False)
    objective = Column(String(500), nullable=True)  # Learning objective
    created_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)

    # Relationships
    math_class = relationship("MathClass", back_populates="worksheets")
    exercises = relationship("WorksheetExercise", back_populates="worksheet", cascade="all, delete-orphan")
    progress = relationship("StudentProgress", back_populates="worksheet", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Worksheet(id={self.id}, title='{self.title}', status='{self.status}')>"
