from pydantic import BaseModel
from typing import Optional


class MathTopicBase(BaseModel):
    """Base schema for MathTopic."""
    topic_name: str
    category: str
    grade: int


class MathTopicResponse(MathTopicBase):
    """Response schema for MathTopic."""
    id: int

    class Config:
        from_attributes = True
