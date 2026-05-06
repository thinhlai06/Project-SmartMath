"""
Gemini Service - Wrapper for Google Generative AI SDK.
Handles text generation and vision analysis for the teacher chatbot.
"""
import asyncio
import logging
import re
from typing import Any, AsyncIterator, Dict, List, Optional

from app.config import settings

logger = logging.getLogger(__name__)

_MAX_RETRIES = 3
_BASE_DELAY = 10  # seconds


class GeminiService:
    """Client for Google Generative AI (Gemini) API."""

    _configured: bool = False
    _genai: Any = None

    @classmethod
    def _ensure_configured(cls) -> None:
        """Configure the SDK once with API key."""
        if cls._configured:
            return

        api_key = (settings.GEMINI_API_KEY or "").strip()
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY chưa được cấu hình. "
                "Vui lòng đặt GEMINI_API_KEY trong file .env."
            )

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            cls._genai = genai
            cls._configured = True
            logger.info("[Gemini] SDK configured successfully")
        except Exception as exc:
            logger.error("[Gemini] Failed to configure SDK: %s", exc)
            raise RuntimeError(f"Không thể cấu hình Gemini SDK: {exc}") from exc

    @classmethod
    def _get_model(
        cls,
        model_name: Optional[str] = None,
        system_instruction: Optional[str] = None,
    ) -> Any:
        """Return a GenerativeModel instance."""
        cls._ensure_configured()
        target_model = model_name or settings.GEMINI_MODEL

        kwargs: Dict[str, Any] = {}
        if system_instruction:
            kwargs["system_instruction"] = system_instruction

        return cls._genai.GenerativeModel(target_model, **kwargs)

    @classmethod
    def is_available(cls) -> bool:
        """Check if Gemini API key is configured."""
        return bool((settings.GEMINI_API_KEY or "").strip())

    @staticmethod
    def _parse_retry_delay(exc: Exception, attempt: int) -> Optional[float]:
        """Extract retry delay from a 429 rate-limit error, or return None."""
        exc_str = str(exc)
        if "429" not in exc_str and "503" not in exc_str and "quota" not in exc_str.lower() and "high demand" not in exc_str.lower():
            return None
        # Try to extract "retry in X.XXs" from the error message
        match = re.search(r"retry\s+(?:in\s+)?(\d+(?:\.\d+)?)\s*s", exc_str, re.IGNORECASE)
        if match:
            return float(match.group(1)) + 1  # add 1s safety margin
        # Fallback: exponential backoff
        return _BASE_DELAY * (2 ** attempt)

    @classmethod
    def generate(
        cls,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """Synchronous text generation. Supports multi-turn via history param.

        Args:
            prompt: The user message.
            system: System instruction for the model.
            temperature: Creativity control (0.0 - 2.0).
            model: Model name override.
            max_tokens: Max output tokens.
            history: Previous messages as [{"role": "user"|"model", "parts": "..."}].

        Returns:
            Generated text string.
        """
        gen_model = cls._get_model(model_name=model, system_instruction=system)

        generation_config = {
            "temperature": temperature,
            "max_output_tokens": max_tokens or settings.GEMINI_MAX_OUTPUT_TOKENS,
        }

        try:
            logger.info(
                "[Gemini] generate | model=%s | temperature=%.2f | history_len=%d",
                model or settings.GEMINI_MODEL,
                temperature,
                len(history) if history else 0,
            )

            if history:
                chat = gen_model.start_chat(history=history)
                response = chat.send_message(
                    prompt,
                    generation_config=generation_config,
                )
            else:
                response = gen_model.generate_content(
                    prompt,
                    generation_config=generation_config,
                )

            return response.text or ""
        except Exception as exc:
            logger.error("[Gemini] Generation error: %s", exc)
            raise RuntimeError(f"Lỗi khi gọi Gemini API: {exc}") from exc

    @classmethod
    async def generate_stream(
        cls,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> AsyncIterator[str]:
        """Yields text chunks for SSE streaming.

        Args:
            prompt: The user message.
            system: System instruction for the model.
            temperature: Creativity control (0.0 - 2.0).
            model: Model name override.
            max_tokens: Max output tokens.
            history: Previous messages as [{"role": "user"|"model", "parts": "..."}].

        Yields:
            Text chunks as they arrive.
        """
        gen_model = cls._get_model(model_name=model, system_instruction=system)

        generation_config = {
            "temperature": temperature,
            "max_output_tokens": max_tokens or settings.GEMINI_MAX_OUTPUT_TOKENS,
        }

        for attempt in range(_MAX_RETRIES):
            try:
                logger.info(
                    "[Gemini] generate_stream | model=%s | temperature=%.2f | history_len=%d | attempt=%d",
                    model or settings.GEMINI_MODEL,
                    temperature,
                    len(history) if history else 0,
                    attempt + 1,
                )

                if history:
                    chat = gen_model.start_chat(history=history)
                    response = chat.send_message(
                        prompt,
                        generation_config=generation_config,
                        stream=True,
                    )
                else:
                    response = gen_model.generate_content(
                        prompt,
                        generation_config=generation_config,
                        stream=True,
                    )

                for chunk in response:
                    if chunk.text:
                        yield chunk.text
                        await asyncio.sleep(0)
                return

            except Exception as exc:
                delay = cls._parse_retry_delay(exc, attempt)
                if delay is not None and attempt < _MAX_RETRIES - 1:
                    logger.warning(
                        "[Gemini] Rate limited (attempt %d/%d), retrying in %.0fs...",
                        attempt + 1, _MAX_RETRIES, delay,
                    )
                    yield f"\n\n⏳ _Đang chờ {int(delay)}s do giới hạn tần suất API..._\n\n"
                    await asyncio.sleep(delay)
                    continue
                logger.error("[Gemini] Stream error: %s", exc)
                yield f"\n\n[Lỗi: {exc}]"
                return

    @classmethod
    def analyze_image(
        cls,
        image_content: bytes,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
    ) -> str:
        """Vision analysis of raw image bytes.

        Args:
            image_content: Raw image bytes (PNG/JPEG/WEBP).
            prompt: Text prompt describing what to analyze.
            system: System instruction for the model.
            model: Model name override.

        Returns:
            Analysis text.
        """
        if not image_content:
            raise ValueError("Dữ liệu ảnh trống")

        gen_model = cls._get_model(model_name=model, system_instruction=system)

        image_part = {
            "mime_type": "image/jpeg",
            "data": image_content,
        }

        generation_config = {
            "temperature": 0.3,
            "max_output_tokens": settings.GEMINI_MAX_OUTPUT_TOKENS,
        }

        try:
            logger.info(
                "[Gemini] analyze_image | model=%s | image_size=%d bytes",
                model or settings.GEMINI_MODEL,
                len(image_content),
            )

            response = gen_model.generate_content(
                [prompt, image_part],
                generation_config=generation_config,
            )

            return response.text or ""
        except Exception as exc:
            logger.error("[Gemini] Image analysis error: %s", exc)
            raise RuntimeError(f"Lỗi phân tích ảnh: {exc}") from exc

    @classmethod
    async def analyze_image_stream(
        cls,
        image_content: bytes,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
    ) -> AsyncIterator[str]:
        """Streaming vision analysis.

        Args:
            image_content: Raw image bytes (PNG/JPEG/WEBP).
            prompt: Text prompt describing what to analyze.
            system: System instruction for the model.
            model: Model name override.

        Yields:
            Text chunks as they arrive.
        """
        if not image_content:
            yield "[Lỗi: Dữ liệu ảnh trống]"
            return

        gen_model = cls._get_model(model_name=model, system_instruction=system)

        image_part = {
            "mime_type": "image/jpeg",
            "data": image_content,
        }

        generation_config = {
            "temperature": 0.3,
            "max_output_tokens": settings.GEMINI_MAX_OUTPUT_TOKENS,
        }

        for attempt in range(_MAX_RETRIES):
            try:
                logger.info(
                    "[Gemini] analyze_image_stream | model=%s | image_size=%d bytes | attempt=%d",
                    model or settings.GEMINI_MODEL,
                    len(image_content),
                    attempt + 1,
                )

                response = gen_model.generate_content(
                    [prompt, image_part],
                    generation_config=generation_config,
                    stream=True,
                )

                for chunk in response:
                    if chunk.text:
                        yield chunk.text
                        await asyncio.sleep(0)
                return

            except Exception as exc:
                delay = cls._parse_retry_delay(exc, attempt)
                if delay is not None and attempt < _MAX_RETRIES - 1:
                    logger.warning(
                        "[Gemini] Rate limited image (attempt %d/%d), retrying in %.0fs...",
                        attempt + 1, _MAX_RETRIES, delay,
                    )
                    yield f"\n\n⏳ _Đang chờ {int(delay)}s do giới hạn tần suất API..._\n\n"
                    await asyncio.sleep(delay)
                    continue
                logger.error("[Gemini] Image stream error: %s", exc)
                yield f"\n\n[Lỗi: {exc}]"
                return
