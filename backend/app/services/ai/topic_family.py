"""Resolve topic metadata into deterministic generation families."""

from __future__ import annotations

from dataclasses import dataclass
import re
import unicodedata
from typing import Literal, Optional


ContentFamily = Literal[
    "arithmetic",
    "geometry",
    "measurement",
    "number_sense",
    "word_problem",
    "data_handling",
]

ArithmeticOperationFamily = Literal[
    "addition",
    "subtraction",
    "multiplication",
    "division_with_remainder",
]


@dataclass(frozen=True)
class TopicGenerationMetadata:
    topic_name: str
    category: str
    topic_slug: str
    content_family: ContentFamily
    operation_family: Optional[ArithmeticOperationFamily]


def _normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value or "")
    stripped = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    stripped = stripped.replace("đ", "d").replace("Đ", "d")
    return re.sub(r"\s+", " ", stripped).strip().lower()


def slugify_topic_name(topic_name: str) -> str:
    normalized = _normalize_text(topic_name)
    slug = re.sub(r"[^a-z0-9]+", "_", normalized).strip("_")
    return slug or "unknown_topic"


def resolve_content_family(category: str) -> ContentFamily:
    normalized = _normalize_text(category)

    if "so hoc" in normalized or "phan so" in normalized:
        return "arithmetic"
    if "hinh hoc" in normalized:
        return "geometry"
    if "do luong" in normalized:
        return "measurement"
    if "tu duy" in normalized or "loi van" in normalized:
        return "word_problem"
    if "thong ke" in normalized or "du lieu" in normalized:
        return "data_handling"

    # Unknown categories default to word-problem style until taxonomy is expanded.
    return "word_problem"


def resolve_arithmetic_operation_family(topic_name: str) -> Optional[ArithmeticOperationFamily]:
    normalized = _normalize_text(topic_name)

    if "chia co du" in normalized:
        return "division_with_remainder"
    if "phep cong" in normalized or "cong co nho" in normalized:
        return "addition"
    if "phep tru" in normalized or "tru co nho" in normalized:
        return "subtraction"
    if "bang nhan" in normalized or "phep nhan" in normalized:
        return "multiplication"
    if "bang chia" in normalized or "phep chia" in normalized:
        return "division_with_remainder"

    # Topics like "Cac so den 100" are not yet supported by bundle-v1.
    return None


def build_topic_generation_metadata(topic_name: str, category: str) -> TopicGenerationMetadata:
    content_family = resolve_content_family(category)
    operation_family: Optional[ArithmeticOperationFamily] = None

    if content_family == "arithmetic":
        operation_family = resolve_arithmetic_operation_family(topic_name)

    return TopicGenerationMetadata(
        topic_name=topic_name,
        category=category,
        topic_slug=slugify_topic_name(topic_name),
        content_family=content_family,
        operation_family=operation_family,
    )
