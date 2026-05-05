from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    """Request body for sending a chat message."""
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    class_id: Optional[int] = None
    student_id: Optional[int] = None


class ChatMessageResponse(BaseModel):
    """Single chat message in a response."""
    role: str
    content: str
    message_type: str = "text"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    """Response for a single chat exchange."""
    session_id: str
    message: ChatMessageResponse
    context: Optional[Dict[str, Any]] = None


class ChatHistoryResponse(BaseModel):
    """Response for chat history retrieval."""
    session_id: str
    messages: List[ChatMessageResponse]
    total_count: int


class ChatSessionListItem(BaseModel):
    """Summary of a chat session for listing."""
    session_id: str
    last_message_preview: str
    message_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
