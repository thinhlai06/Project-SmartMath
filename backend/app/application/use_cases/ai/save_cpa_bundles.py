from __future__ import annotations

from typing import Dict, List

from fastapi import HTTPException

from app.domain.repositories.cpa_bundle_repository import CPABundleRepository
from app.schemas.cpa_bundle import CPABundle
from app.services.ai.cpa_validator import CPABundleValidator


class SaveCPABundlesUseCase:
    """Persist teacher-approved CPA bundles."""

    def __init__(self, repository: CPABundleRepository, validator: CPABundleValidator):
        self.repository = repository
        self.validator = validator

    def execute(self, worksheet_id: int, bundles: List[CPABundle]) -> Dict[str, int | Dict[str, int]]:
        if not bundles:
            raise HTTPException(status_code=400, detail="Danh sach bundle trong")

        validation_counts = {"passed": 0, "warning": 0, "failed": 0}

        for bundle in bundles:
            result = self.validator.validate(bundle)
            bundle.validation_status = result.status
            bundle.validator_messages = result.issues
            validation_counts[result.status] = validation_counts.get(result.status, 0) + 1

        saved_count = self.repository.save_many(worksheet_id=worksheet_id, bundles=bundles)
        return {
            "worksheet_id": worksheet_id,
            "saved_count": saved_count,
            "validation_summary": validation_counts,
        }