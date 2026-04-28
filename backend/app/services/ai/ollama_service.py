"""
Ollama Service - Wrapper for Ollama native API.
Handles text generation and cloud OCR requests.
"""
import base64
import logging
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urlsplit, urlunsplit

import requests

from app.config import settings

logger = logging.getLogger(__name__)


def _emit_info(message: str, *args: Any) -> None:
    """Emit AI runtime logs robustly across uvicorn, jobs, and direct scripts."""
    module_logger = logger
    uvicorn_logger = logging.getLogger("uvicorn.error")

    module_logger.info(message, *args)
    if uvicorn_logger is not module_logger:
        uvicorn_logger.info(message, *args)

    # Fallback for contexts without logging handlers (e.g. ad-hoc scripts/jobs).
    root_logger = logging.getLogger()
    has_handler = module_logger.hasHandlers() or uvicorn_logger.hasHandlers() or root_logger.hasHandlers()
    if not has_handler:
        try:
            print(message % args)
        except Exception:
            print(message)


class OllamaService:
    """Client for Ollama native API."""

    @staticmethod
    def _log_runtime_models(action: str, target_model: str) -> None:
        """Log requested model and currently loaded models for terminal visibility."""
        loaded_models = OllamaService.get_loaded_models()
        if loaded_models:
            _emit_info(
                "[AI] %s | requested_model=%s | loaded_models=%s",
                action,
                target_model,
                ", ".join(loaded_models),
            )
            return
        _emit_info(
            "[AI] %s | requested_model=%s | loaded_models=none",
            action,
            target_model,
        )

    @staticmethod
    def is_running() -> bool:
        """Check if Ollama daemon is running."""
        try:
            resp = requests.get(f"{settings.OLLAMA_API_BASE}/tags", timeout=3)
            return resp.status_code == 200
        except Exception:
            return False

    @staticmethod
    def get_loaded_models() -> List[str]:
        """Get list of currently loaded/running models in Ollama."""
        try:
            resp = requests.get(f"{settings.OLLAMA_API_BASE}/ps", timeout=3)
            if resp.status_code != 200:
                return []
            data = resp.json()
            models = data.get("models", []) if isinstance(data, dict) else []
            result: List[str] = []
            for item in models:
                if not isinstance(item, dict):
                    continue
                name = item.get("name") or item.get("model") or ""
                if isinstance(name, str) and name.strip():
                    result.append(name.strip())
            return result
        except Exception:
            return []

    @staticmethod
    def _strip_thinking(text: str) -> str:
        """Remove thinking blocks to improve JSON parsing stability."""
        if not text:
            return ""
        cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.IGNORECASE | re.DOTALL)
        return cleaned.strip()

    @staticmethod
    def _extract_content(payload: Dict[str, Any]) -> str:
        if isinstance(payload.get("message"), dict):
            content = payload["message"].get("content", "")
        else:
            content = payload.get("response", "")

        if not isinstance(content, str):
            content = str(content or "")

        return OllamaService._strip_thinking(content)

    @staticmethod
    def generate(
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        think: bool = False,
        format: Optional[str] = None,
    ) -> str:
        """Generate text using Ollama chat API with configurable keep_alive."""
        target_model = model or settings.OLLAMA_TEXT_MODEL

        messages: List[Dict[str, Any]] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        options: Dict[str, Any] = {"temperature": temperature}
        if max_tokens:
            options["num_predict"] = max_tokens

        payload: Dict[str, Any] = {
            "model": target_model,
            "messages": messages,
            "options": options,
            "keep_alive": settings.OLLAMA_KEEP_ALIVE,
            "stream": False,
            "think": think,
        }
        if format:
            payload["format"] = format

        try:
            OllamaService._log_runtime_models("text_generation", target_model)
            _emit_info(
                "[AI] sending_request | endpoint=/chat | model=%s | temperature=%.2f | timeout=%ss",
                target_model,
                temperature,
                settings.OLLAMA_TIMEOUT,
            )
            resp = requests.post(
                f"{settings.OLLAMA_API_BASE}/chat",
                json=payload,
                timeout=settings.OLLAMA_TIMEOUT,
            )
            if resp.status_code == 404:
                return OllamaService._generate_with_legacy_endpoint(
                    prompt=prompt,
                    system=system,
                    temperature=temperature,
                    model=target_model,
                    max_tokens=max_tokens,
                    format=format,
                )
            resp.raise_for_status()
            return OllamaService._extract_content(resp.json())
        except requests.exceptions.ConnectionError:
            logger.error("Ollama server not reachable")
            raise ConnectionError(
                "Khong the ket noi Ollama. Vui long kiem tra Ollama daemon dang chay."
            )
        except requests.exceptions.Timeout:
            logger.error("Ollama request timed out")
            raise TimeoutError("Ollama phan hoi qua lau. Vui long thu lai.")
        except Exception as e:
            logger.error("Ollama Error: %s", e)
            raise

    @staticmethod
    def _generate_with_legacy_endpoint(
        prompt: str,
        system: Optional[str],
        temperature: float,
        model: str,
        max_tokens: Optional[int] = None,
        format: Optional[str] = None,
    ) -> str:
        """Fallback to /generate endpoint for compatibility."""
        options: Dict[str, Any] = {"temperature": temperature}
        if max_tokens:
            options["num_predict"] = max_tokens

        payload = {
            "model": model,
            "prompt": prompt,
            "system": system,
            "options": options,
            "keep_alive": settings.OLLAMA_KEEP_ALIVE,
            "stream": False,
        }
        if format:
            payload["format"] = format
        _emit_info(
            "[AI] fallback_request | endpoint=/generate | model=%s | temperature=%.2f | timeout=%ss",
            model,
            temperature,
            settings.OLLAMA_TIMEOUT,
        )
        resp = requests.post(
            f"{settings.OLLAMA_API_BASE}/generate",
            json=payload,
            timeout=settings.OLLAMA_TIMEOUT,
        )
        resp.raise_for_status()
        return OllamaService._extract_content(resp.json())

    @staticmethod
    def vision_recognize_cloud(
        image_content: bytes,
        prompt: str = "Hay doc va trich xuat toan bo noi dung chu viet tay trong anh nay. Tra ve text thuan tuy, moi dong tren mot hang.",
        model: Optional[str] = None,
    ) -> str:
        """
        Use Ollama Cloud API for OCR with Authorization bearer token.
        """
        if not image_content:
            raise ValueError("Empty image data")

        api_key = (settings.OLLAMA_CLOUD_API_KEY or "").strip()
        if not api_key:
            raise ValueError("Chua cau hinh OLLAMA_CLOUD_API_KEY")

        target_model = model or settings.OLLAMA_CLOUD_VISION_MODEL
        candidate_models = [target_model]
        if target_model.endswith("-cloud"):
            candidate_models.append(target_model[: -len("-cloud")])

        image_b64 = base64.b64encode(image_content).decode("utf-8")
        cloud_base = OllamaService._normalize_cloud_api_base(settings.OLLAMA_CLOUD_API_BASE)
        endpoint = f"{cloud_base}/chat"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        max_retries = 2
        last_timeout_exc: Optional[Exception] = None
        for attempt in range(1, max_retries + 1):
            try:
                last_model_not_found_error: Optional[str] = None
                for model_name in candidate_models:
                    payload = {
                        "model": model_name,
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt,
                                "images": [image_b64],
                            }
                        ],
                        "options": {"temperature": 0.1},
                        "stream": False,
                    }

                    _emit_info(
                        "[AI] sending_request | endpoint=%s | model=%s | timeout=%ss | attempt=%d/%d",
                        endpoint,
                        model_name,
                        settings.OLLAMA_CLOUD_TIMEOUT,
                        attempt,
                        max_retries,
                    )

                    resp = requests.post(
                        endpoint,
                        json=payload,
                        headers=headers,
                        timeout=settings.OLLAMA_CLOUD_TIMEOUT,
                    )

                    if resp.status_code == 404:
                        try:
                            error_text = str(resp.json().get("error", "")).strip()
                        except Exception:
                            error_text = (resp.text or "").strip()

                        if "model" in error_text.lower() and "not found" in error_text.lower():
                            last_model_not_found_error = error_text
                            logger.warning("Cloud OCR model not found on API: %s", model_name)
                            continue

                    resp.raise_for_status()
                    return OllamaService._extract_content(resp.json())

                if last_model_not_found_error:
                    raise RuntimeError(f"Cloud OCR tra ve loi: {last_model_not_found_error}")

                raise RuntimeError("Cloud OCR tra ve loi tu he thong.")
            except requests.exceptions.Timeout as exc:
                last_timeout_exc = exc
                logger.warning("Ollama Cloud OCR timed out (attempt %d/%d)", attempt, max_retries)
                if attempt < max_retries:
                    continue
                raise TimeoutError("Cloud OCR phan hoi qua lau. Vui long thu lai.") from exc
            except requests.exceptions.ConnectionError as exc:
                logger.error("Ollama Cloud OCR not reachable")
                raise ConnectionError("Khong the ket noi Ollama Cloud OCR.") from exc
            except requests.exceptions.HTTPError as exc:
                detail = ""
                response = getattr(exc, "response", None)
                if response is not None:
                    try:
                        payload_error = response.json().get("error", "") if isinstance(response.json(), dict) else ""
                    except Exception:
                        payload_error = response.text or ""
                    detail = str(payload_error).strip()

                if detail:
                    logger.error("Ollama Cloud OCR HTTP error: %s | detail=%s", exc, detail)
                    raise RuntimeError(f"Cloud OCR tra ve loi: {detail}") from exc

                logger.error("Ollama Cloud OCR HTTP error: %s", exc)
                raise RuntimeError("Cloud OCR tra ve loi tu he thong.") from exc
            except Exception as exc:
                if isinstance(exc, RuntimeError):
                    raise
                logger.error("Ollama Cloud OCR error: %s", exc)
                raise RuntimeError("Co loi khi xu ly Cloud OCR.") from exc

    @staticmethod
    def _normalize_cloud_api_base(raw_base: Optional[str]) -> str:
        """
        Normalize cloud base URL to official Ollama Cloud API format:
        https://ollama.com/api

        Backward-compatible inputs auto-converted:
        - https://api.ollama.com/v1 -> https://ollama.com/api
        - https://ollama.com/v1 -> https://ollama.com/api
        - https://api.ollama.com -> https://ollama.com/api
        """
        base = (raw_base or "").strip() or "https://ollama.com/api"
        if "//" not in base:
            base = f"https://{base}"

        parsed = urlsplit(base)
        netloc = parsed.netloc.lower().strip()
        path = parsed.path.rstrip("/")

        if netloc == "api.ollama.com":
            logger.warning("Auto-correcting OLLAMA_CLOUD_API_BASE host from api.ollama.com to ollama.com")
            netloc = "ollama.com"

        if path.endswith("/chat"):
            path = path[: -len("/chat")]

        if not path or path == "/v1":
            path = "/api"

        return urlunsplit((parsed.scheme or "https", netloc, path, "", "")).rstrip("/")

    @staticmethod
    def unload_model(model: Optional[str] = None) -> None:
        """Request Ollama to unload a model immediately."""
        target_model = model or settings.OLLAMA_TEXT_MODEL
        payload = {
            "model": target_model,
            "prompt": "",
            "keep_alive": 0,
            "stream": False,
        }
        try:
            requests.post(
                f"{settings.OLLAMA_API_BASE}/generate",
                json=payload,
                timeout=10,
            )
        except Exception:
            logger.warning("Could not unload model '%s' immediately", target_model)
