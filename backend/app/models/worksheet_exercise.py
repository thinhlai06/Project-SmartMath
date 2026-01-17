from sqlalchemy import Column, Integer, String, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class ExerciseType(str, enum.Enum):
    """CPA exercise types."""
    CONCRETE = "concrete"
    PICTORIAL = "pictorial"
    ABSTRACT = "abstract"


class DifficultyTier(str, enum.Enum):
    """Differentiation difficulty tiers."""
    FOUNDATION = "foundation"
    STANDARD = "standard"
    EXTENSION = "extension"
    ADVANCED = "advanced"


class WorksheetExercise(Base):
    """Individual exercise within a worksheet."""
    
    __tablename__ = "worksheet_exercises"

    id = Column(Integer, primary_key=True, index=True)
    worksheet_id = Column(Integer, ForeignKey("worksheets.id"), nullable=False)
    exercise_type = Column(SQLEnum(ExerciseType), nullable=True)  # For CPA worksheets
    difficulty_tier = Column(SQLEnum(DifficultyTier), nullable=True)  # For differentiation
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    hint = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    # Relationships
    worksheet = relationship("Worksheet", back_populates="exercises")

    def __repr__(self):
        return f"<WorksheetExercise(id={self.id}, type='{self.exercise_type}')>"
