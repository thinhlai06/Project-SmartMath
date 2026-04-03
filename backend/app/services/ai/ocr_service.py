"""
OCR Service using Ollama Vision API (glm-ocr:latest model).
"""
import logging
import json
import re
from typing import Any, Dict, List
from .ollama_service import OllamaService

logger = logging.getLogger(__name__)


class OCRService:
    """OCR service that uses Ollama Vision model for text recognition."""

    def recognize(self, image_content: bytes) -> str:
        payload = self.recognize_with_confidence(image_content)
        return str(payload.get("raw_text", "")).strip()

    def recognize_with_confidence(self, image_content: bytes) -> Dict[str, Any]:
        """
        Recognize text from an image using Ollama Vision API.
        Sends the image to glm-ocr:latest model running in Ollama.
        """
        if not image_content:
            raise ValueError("Empty image data")

        prompt = (
            "Bạn là hệ thống OCR chuyên đọc chữ viết tay tiếng Việt trong bài Toán tiểu học.\n"
            "Hãy trích xuất nội dung và độ tin cậy đọc được cho từng từ/cụm số.\n"
            "BẮT BUỘC trả về JSON object đúng định dạng sau:\n"
            "{\n"
            "  \"raw_text\": \"toàn bộ nội dung theo dòng\",\n"
            "  \"tokens\": [\n"
            "    {\"text\": \"từ hoặc số\", \"confidence\": 0.0}\n"
            "  ]\n"
            "}\n"
            "Trong đó confidence là số thực từ 0 đến 1.\n"
            "Không được trả về markdown, không được thêm giải thích ngoài JSON."
        )

        try:
            result = OllamaService.vision_recognize(
                image_content=image_content,
                prompt=prompt
            )
            parsed = self._parse_ocr_payload(result)
            return parsed
        except Exception as e:
            logger.error(f"OCR Error: {e}")
            raise

    def _parse_ocr_payload(self, payload_text: str) -> Dict[str, Any]:
        """Parse OCR JSON payload and fallback to plain text parsing if needed."""
        default_result = {
            "raw_text": payload_text.strip(),
            "tokens": [],
            "avg_confidence": 0.0,
        }

        try:
            clean = re.sub(r"```json|```", "", payload_text).strip()
            data = json.loads(clean)
            if not isinstance(data, dict):
                return self._fallback_from_text(payload_text)

            raw_text = str(data.get("raw_text", "")).strip()
            tokens_input = data.get("tokens", [])
            tokens: List[Dict[str, Any]] = []

            if isinstance(tokens_input, list):
                for item in tokens_input:
                    if not isinstance(item, dict):
                        continue
                    text = str(item.get("text", "")).strip()
                    if not text:
                        continue
                    conf_raw = item.get("confidence", 0.0)
                    try:
                        conf = float(conf_raw)
                    except (TypeError, ValueError):
                        conf = 0.0
                    conf = max(0.0, min(1.0, conf))
                    tokens.append({"text": text, "confidence": conf})

            if not raw_text and tokens:
                raw_text = " ".join(token["text"] for token in tokens)

            if not raw_text:
                return self._fallback_from_text(payload_text)

            avg_confidence = sum(token["confidence"] for token in tokens) / len(tokens) if tokens else 0.0
            return {
                "raw_text": raw_text,
                "tokens": tokens,
                "avg_confidence": round(avg_confidence, 4),
            }
        except Exception:
            return self._fallback_from_text(payload_text)

    def _fallback_from_text(self, text: str) -> Dict[str, Any]:
        raw = text.strip()
        if not raw:
            return {"raw_text": "", "tokens": [], "avg_confidence": 0.0}

        words = [w for w in re.split(r"\s+", raw) if w]
        # Conservative fallback confidence when model does not return structured scores.
        tokens = [{"text": w, "confidence": 0.55} for w in words]
        return {
            "raw_text": raw,
            "tokens": tokens,
            "avg_confidence": 0.55 if tokens else 0.0,
        }
