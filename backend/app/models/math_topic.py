from sqlalchemy import Column, Integer, String

from app.database import Base


class MathTopic(Base):
    """Math topic model following Vietnamese curriculum (GDPT 2018)."""
    
    __tablename__ = "math_topics"

    id = Column(Integer, primary_key=True, index=True)
    topic_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # Số học, Hình học, Đo lường, etc.
    grade = Column(Integer, nullable=False)  # 1, 2, or 3

    def __repr__(self):
        return f"<MathTopic(id={self.id}, name='{self.topic_name}', grade={self.grade})>"
