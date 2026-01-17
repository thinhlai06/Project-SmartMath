from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import secrets
import string

from app.database import Base


def generate_class_code(length: int = 6) -> str:
    """Generate a random class code."""
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


class MathClass(Base):
    """Math class model."""
    
    __tablename__ = "math_classes"

    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String(100), nullable=False)
    grade = Column(Integer, nullable=False)  # 1, 2, or 3
    class_code = Column(String(10), unique=True, index=True, default=generate_class_code)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    teacher = relationship("User", back_populates="classes")
    students = relationship("Student", back_populates="math_class", cascade="all, delete-orphan")
    worksheets = relationship("Worksheet", back_populates="math_class", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="math_class", cascade="all, delete-orphan")
    parent_links = relationship("ParentClassLink", back_populates="math_class", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MathClass(id={self.id}, name='{self.class_name}', grade={self.grade})>"
