"""
OCR Service using LMStudio Vision API (PaddleOCR-VL model).
Replaces direct PaddleOCR Python library usage.
"""
import logging
from .lmstudio_service import LMStudioService

logger = logging.getLogger(__name__)


class OCRService:
    """OCR service that uses LMStudio Vision model for text recognition."""

    def recognize(self, image_content: bytes) -> str:
        """
        Recognize text from an image using LMStudio Vision API.
        Sends the image to PaddleOCR-VL model running in LMStudio.
        """
        if not image_content:
            raise ValueError("Empty image data")

        prompt = (
            "Bạn là hệ thống OCR chuyên đọc chữ viết tay tiếng Việt trong bài làm Toán tiểu học.\n"
            "Hãy đọc và trích xuất TOÀN BỘ nội dung chữ viết trong ảnh này.\n"
            "Bao gồm: số thứ tự câu hỏi, nội dung đề bài, phép tính, và câu trả lời/lời giải của học sinh.\n"
            "Trả về text thuần túy, giữ nguyên bố cục từng dòng.\n"
            "CHỈ TRẢ VỀ NỘI DUNG ĐỌC ĐƯỢC, KHÔNG THÊM GIẢI THÍCH."
        )

        try:
            result = LMStudioService.vision_recognize(
                image_content=image_content,
                prompt=prompt
            )
            return result.strip()
        except Exception as e:
            logger.error(f"OCR Error: {e}")
            raise
