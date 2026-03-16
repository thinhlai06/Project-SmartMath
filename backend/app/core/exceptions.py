"""
Centralized exception handling for Smart-MathAI.
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class SmartMathException(Exception):
    """Base exception for Smart-MathAI."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class AIServiceUnavailableError(SmartMathException):
    """Raised when AI service (LMStudio) is not available."""
    def __init__(self, service_name: str = "LMStudio"):
        super().__init__(
            message=f"Dịch vụ AI ({service_name}) không khả dụng. Vui lòng kiểm tra LMStudio đang chạy.",
            status_code=503
        )


class AIGenerationError(SmartMathException):
    """Raised when AI generation fails."""
    def __init__(self, detail: str = ""):
        super().__init__(
            message=f"Sinh nội dung AI thất bại. {detail}",
            status_code=500
        )


class OCRError(SmartMathException):
    """Raised when OCR processing fails."""
    def __init__(self, detail: str = ""):
        super().__init__(
            message=f"Nhận dạng chữ viết thất bại. {detail}",
            status_code=400
        )


async def smartmath_exception_handler(request: Request, exc: SmartMathException):
    """Global handler for SmartMathException."""
    logger.error(f"SmartMathException: {exc.message} | Path: {request.url.path}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )
