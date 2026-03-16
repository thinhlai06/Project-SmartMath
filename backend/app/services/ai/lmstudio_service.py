"""
LMStudio Service - Wrapper for LMStudio's OpenAI-compatible API.
Handles both text generation (Qwen2.5) and vision OCR (PaddleOCR-VL).
"""
import requests
import base64
import logging
from typing import Optional, List, Dict, Any

from app.config import settings

logger = logging.getLogger(__name__)


class LMStudioService:
    """Client for LMStudio's OpenAI-compatible API."""

    @staticmethod
    def is_running() -> bool:
        """Check if LMStudio server is running."""
        try:
            resp = requests.get(
                f"{settings.LMSTUDIO_API_BASE}/models",
                timeout=3
            )
            return resp.status_code == 200
        except Exception:
            return False

    @staticmethod
    def get_loaded_models() -> List[str]:
        """Get list of currently loaded models in LMStudio."""
        try:
            resp = requests.get(
                f"{settings.LMSTUDIO_API_BASE}/models",
                timeout=3
            )
            if resp.status_code == 200:
                data = resp.json()
                return [m["id"] for m in data.get("data", [])]
            return []
        except Exception:
            return []

    @staticmethod
    def generate(
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        model: Optional[str] = None
    ) -> str:
        """
        Generate text using LMStudio's chat completions API.
        Uses the text model (Qwen2.5) by default.
        """
        target_model = model or settings.LMSTUDIO_TEXT_MODEL

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": temperature,
            "stream": False
        }

        try:
            resp = requests.post(
                f"{settings.LMSTUDIO_API_BASE}/chat/completions",
                json=payload,
                timeout=settings.LMSTUDIO_TIMEOUT
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except requests.exceptions.ConnectionError:
            logger.error("LMStudio server not reachable")
            raise ConnectionError(
                "Không thể kết nối LMStudio. Vui lòng kiểm tra LMStudio đang chạy ở cổng 1234."
            )
        except requests.exceptions.Timeout:
            logger.error("LMStudio request timed out")
            raise TimeoutError(
                "LMStudio phản hồi quá lâu. Vui lòng thử lại."
            )
        except Exception as e:
            logger.error(f"LMStudio Error: {e}")
            raise

    @staticmethod
    def vision_recognize(
        image_content: bytes,
        prompt: str = "Hãy đọc và trích xuất toàn bộ nội dung chữ viết tay trong ảnh này. Trả về text thuần túy, mỗi dòng trên một hàng.",
        model: Optional[str] = None
    ) -> str:
        """
        Use LMStudio Vision model (PaddleOCR-VL) to recognize text from an image.
        Sends image as base64 in a multimodal chat completion request.
        """
        target_model = model or settings.LMSTUDIO_VISION_MODEL

        # Encode image to base64
        image_b64 = base64.b64encode(image_content).decode("utf-8")

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_b64}"
                        }
                    }
                ]
            }
        ]

        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": 0.1,  # Low temperature for OCR accuracy
            "stream": False
        }

        try:
            resp = requests.post(
                f"{settings.LMSTUDIO_API_BASE}/chat/completions",
                json=payload,
                timeout=settings.LMSTUDIO_TIMEOUT
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except requests.exceptions.ConnectionError:
            logger.error("LMStudio server not reachable for vision")
            raise ConnectionError(
                "Không thể kết nối LMStudio cho OCR. Vui lòng kiểm tra LMStudio đang chạy."
            )
        except requests.exceptions.Timeout:
            logger.error("LMStudio vision request timed out")
            raise TimeoutError(
                "OCR phản hồi quá lâu. Hình ảnh có thể quá lớn."
            )
        except Exception as e:
            logger.error(f"LMStudio Vision Error: {e}")
            raise
