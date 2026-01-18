from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Student(Base):
    """Student model."""
    
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    class_id = Column(Integer, ForeignKey("math_classes.id"), nullable=False)
    tier = Column(String(20), default="standard")  # foundation, standard, extension, advanced
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    math_class = relationship("MathClass", back_populates="students")
    progress = relationship("StudentProgress", back_populates="student", cascade="all, delete-orphan")
    parent_links = relationship("ParentClassLink", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Student(id={self.id}, name='{self.full_name}')>"

