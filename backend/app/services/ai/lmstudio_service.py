"""Deprecated compatibility adapter for LMStudioService name."""
import warnings
from typing import List, Optional

from .ollama_service import OllamaService


class LMStudioService:
    """Deprecated wrapper kept to avoid breaking old imports."""

    _warning_shown = False

    @classmethod
    def _warn(cls) -> None:
        if cls._warning_shown:
            return
        warnings.warn(
            "LMStudioService is deprecated. Use OllamaService instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        cls._warning_shown = True

    @classmethod
    def is_running(cls) -> bool:
        cls._warn()
        return OllamaService.is_running()

    @classmethod
    def get_loaded_models(cls) -> List[str]:
        cls._warn()
        return OllamaService.get_loaded_models()

    @classmethod
    def generate(
        cls,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        model: Optional[str] = None,
    ) -> str:
        cls._warn()
        return OllamaService.generate(
            prompt=prompt,
            system=system,
            temperature=temperature,
            model=model,
        )

    @classmethod
    def vision_recognize(
        cls,
        image_content: bytes,
        prompt: str = "Hay doc va trich xuat toan bo noi dung chu viet tay trong anh nay. Tra ve text thuan tuy, moi dong tren mot hang.",
        model: Optional[str] = None,
    ) -> str:
        cls._warn()
        return OllamaService.vision_recognize(
            image_content=image_content,
            prompt=prompt,
            model=model,
        )
