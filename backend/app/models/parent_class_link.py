from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class ParentClassLink(Base):
    """Link between parent, class, and their child (student)."""
    
    __tablename__ = "parent_class_links"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("math_classes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    parent = relationship("User", back_populates="parent_links")
    math_class = relationship("MathClass", back_populates="parent_links")
    student = relationship("Student", back_populates="parent_links")

    def __repr__(self):
        return f"<ParentClassLink(parent_id={self.parent_id}, class_id={self.class_id})>"
