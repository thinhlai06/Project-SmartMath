"""
Chat Router - API endpoints for AI teacher chatbot.
All endpoints require Teacher authentication.
"""
import logging
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import get_current_teacher
from app.models.user import User
from app.models.chat_message import ChatMessage
from app.schemas.chat import (
    ChatHistoryResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    ChatResponse,
    ChatSessionListItem,
)
from app.services.ai.chat_service import ChatService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chatbot"])

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp"}
HISTORY_LIMIT = 20


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _save_message(
    db: Session,
    teacher_id: int,
    session_id: str,
    role: str,
    content: str,
    message_type: str = "text",
    context_metadata: Optional[dict] = None,
) -> ChatMessage:
    """Persist a chat message to the database."""
    msg = ChatMessage(
        teacher_id=teacher_id,
        session_id=session_id,
        role=role,
        content=content,
        message_type=message_type,
        context_metadata=context_metadata,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def _get_session_history(
    db: Session,
    teacher_id: int,
    session_id: str,
    limit: int = HISTORY_LIMIT,
) -> list:
    """Return Gemini-compatible history list from DB."""
    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.teacher_id == teacher_id,
            ChatMessage.session_id == session_id,
        )
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    messages.reverse()

    history = []
    for msg in messages:
        role = "model" if msg.role == "assistant" else "user"
        history.append({"role": role, "parts": msg.content})
    return history


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/send", response_model=ChatResponse)
async def send_message(
    request: ChatMessageRequest,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    """Send a text message and get a non-streaming response."""
    session_id = request.session_id or str(uuid.uuid4())

    _save_message(db, teacher.id, session_id, "user", request.message)

    history = _get_session_history(db, teacher.id, session_id)

    service = ChatService(db, teacher.id)
    result = service.handle_message(
        message=request.message,
        class_id=request.class_id,
        student_id=request.student_id,
        history=history,
    )

    _save_message(
        db, teacher.id, session_id, "assistant",
        result["content"], result["message_type"], result.get("context"),
    )

    return ChatResponse(
        session_id=session_id,
        message=ChatMessageResponse(
            role="assistant",
            content=result["content"],
            message_type=result["message_type"],
        ),
        context=result.get("context"),
    )


@router.post("/send-stream")
async def send_message_stream(
    request: ChatMessageRequest,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    """Send a text message and get an SSE streaming response."""
    session_id = request.session_id or str(uuid.uuid4())

    _save_message(db, teacher.id, session_id, "user", request.message)

    history = _get_session_history(db, teacher.id, session_id)

    service = ChatService(db, teacher.id)

    async def event_generator():
        full_content = ""
        try:
            yield f"event: session_id\ndata: {session_id}\n\n"

            async for chunk in service.handle_message_stream(
                message=request.message,
                class_id=request.class_id,
                student_id=request.student_id,
                history=history,
            ):
                full_content += chunk
                yield f"data: {chunk}\n\n"

            yield "event: done\ndata: [DONE]\n\n"

            _save_message(
                db, teacher.id, session_id, "assistant",
                full_content, "text",
            )

        except Exception as exc:
            logger.error("[Chat] Stream error: %s", exc)
            yield f"event: error\ndata: {str(exc)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/analyze-image", response_model=ChatResponse)
async def analyze_image(
    file: UploadFile = File(...),
    prompt: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None),
    analysis_type: Optional[str] = Form("homework"),
    class_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    """Upload an image for analysis (homework or whiteboard)."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Loại file không hỗ trợ: {file.content_type}. Chỉ chấp nhận PNG, JPEG, WEBP.",
        )

    image_content = await file.read()
    if len(image_content) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ảnh quá lớn. Giới hạn 10MB.",
        )

    session_id = session_id or str(uuid.uuid4())

    user_msg = prompt or f"📷 Phân tích ảnh ({analysis_type})"
    _save_message(db, teacher.id, session_id, "user", user_msg, "image")

    service = ChatService(db, teacher.id)
    result = service.handle_image(
        image_content=image_content,
        prompt=prompt,
        analysis_type=analysis_type or "homework",
    )

    _save_message(
        db, teacher.id, session_id, "assistant",
        result["content"], result["message_type"],
    )

    return ChatResponse(
        session_id=session_id,
        message=ChatMessageResponse(
            role="assistant",
            content=result["content"],
            message_type=result["message_type"],
        ),
    )


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_history(
    session_id: str,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    """Get chat history for a session."""
    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.teacher_id == teacher.id,
            ChatMessage.session_id == session_id,
        )
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return ChatHistoryResponse(
        session_id=session_id,
        messages=[
            ChatMessageResponse(
                role=msg.role,
                content=msg.content,
                message_type=msg.message_type or "text",
                created_at=msg.created_at,
            )
            for msg in messages
        ],
        total_count=len(messages),
    )


@router.get("/sessions", response_model=List[ChatSessionListItem])
async def list_sessions(
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    """List all chat sessions for the current teacher."""
    sessions = (
        db.query(
            ChatMessage.session_id,
            func.count(ChatMessage.id).label("message_count"),
            func.min(ChatMessage.created_at).label("created_at"),
            func.max(ChatMessage.created_at).label("updated_at"),
        )
        .filter(ChatMessage.teacher_id == teacher.id)
        .group_by(ChatMessage.session_id)
        .order_by(func.max(ChatMessage.created_at).desc())
        .all()
    )

    result = []
    for s in sessions:
        last_msg = (
            db.query(ChatMessage.content)
            .filter(
                ChatMessage.teacher_id == teacher.id,
                ChatMessage.session_id == s.session_id,
            )
            .order_by(ChatMessage.created_at.desc())
            .first()
        )
        preview = (last_msg.content[:80] + "...") if last_msg and len(last_msg.content) > 80 else (last_msg.content if last_msg else "")

        result.append(
            ChatSessionListItem(
                session_id=s.session_id,
                last_message_preview=preview,
                message_count=s.message_count,
                created_at=s.created_at,
                updated_at=s.updated_at,
            )
        )

    return result


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    """Delete a chat session and all its messages."""
    deleted_count = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.teacher_id == teacher.id,
            ChatMessage.session_id == session_id,
        )
        .delete()
    )
    db.commit()

    return {
        "message": "Đã xóa phiên chat",
        "deleted_count": deleted_count,
    }
