from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List

from app.schemas.cpa_bundle import CPABundle


class CPABundleRepository(ABC):
    """Port for CPA bundle persistence operations."""

    @abstractmethod
    def save_many(self, worksheet_id: int, bundles: List[CPABundle]) -> int:
        raise NotImplementedError

    @abstractmethod
    def get_by_worksheet_id(self, worksheet_id: int) -> List[CPABundle]:
        raise NotImplementedError

    @abstractmethod
    def delete_by_worksheet_id(self, worksheet_id: int) -> None:
        raise NotImplementedError