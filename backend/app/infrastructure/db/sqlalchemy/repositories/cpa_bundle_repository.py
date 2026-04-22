from __future__ import annotations

import json
from typing import List, cast

from sqlalchemy.orm import Session

from app.domain.repositories.cpa_bundle_repository import CPABundleRepository
from app.models.cpa_bundle import CPABundleRecord
from app.models.worksheet_exercise import WorksheetExercise, ExerciseType
from app.schemas.cpa_bundle import CPABundle, ContentFamily, MathCore, ValidationStatus


class SqlAlchemyCPABundleRepository(CPABundleRepository):
    """SQLAlchemy persistence for CPA bundles."""

    def __init__(self, db: Session):
        self.db = db

    def save_many(self, worksheet_id: int, bundles: List[CPABundle]) -> int:
        self.delete_by_worksheet_id(worksheet_id, commit=False)
        records: List[CPABundleRecord] = []
        for index, bundle in enumerate(bundles):
            core_payload: dict = {
                "content_family": bundle.content_family,
                "family_payload": bundle.family_payload,
            }
            if bundle.math_core is not None:
                core_payload["math_core"] = bundle.math_core.model_dump()

            record = CPABundleRecord(
                worksheet_id=worksheet_id,
                math_core_json=json.dumps(core_payload, ensure_ascii=False),
                concrete_spec_json=json.dumps(bundle.concrete.model_dump(), ensure_ascii=False),
                pictorial_spec_json=json.dumps(bundle.pictorial.model_dump(), ensure_ascii=False),
                abstract_spec_json=json.dumps(bundle.abstract.model_dump(), ensure_ascii=False),
                validation_status=bundle.validation_status,
                validator_messages_json=json.dumps(
                    [message.model_dump() for message in bundle.validator_messages],
                    ensure_ascii=False,
                ),
                teacher_approved=bundle.validation_status in {"passed", "warning"},
                order_index=index,
            )
            records.append(record)

        self.db.add_all(records)

        # Delete existing worksheet exercises for this worksheet to resync
        self.db.query(WorksheetExercise).filter(WorksheetExercise.worksheet_id == worksheet_id).delete(synchronize_session=False)

        # Sync bundles to WorksheetExercises
        exercises: List[WorksheetExercise] = []
        exercise_order = 0

        for bundle in bundles:
            # Concrete
            if bundle.concrete:
                exercises.append(WorksheetExercise(
                    worksheet_id=worksheet_id,
                    exercise_type=ExerciseType.CONCRETE,
                    question=f"{bundle.concrete.action_instruction}\n{bundle.concrete.result_prompt}".strip(),
                    answer=bundle.concrete.answer,
                    hint=None,
                    order_index=exercise_order
                ))
                exercise_order += 1

            # Pictorial
            if bundle.pictorial:
                exercises.append(WorksheetExercise(
                    worksheet_id=worksheet_id,
                    exercise_type=ExerciseType.PICTORIAL,
                    question=f"{bundle.pictorial.question_text}\n[Sơ đồ: {bundle.pictorial.diagram_type}]",
                    answer=bundle.pictorial.answer,
                    hint=None,
                    order_index=exercise_order
                ))
                exercise_order += 1

            # Abstract
            if bundle.abstract:
                exercises.append(WorksheetExercise(
                    worksheet_id=worksheet_id,
                    exercise_type=ExerciseType.ABSTRACT,
                    question=bundle.abstract.expression,
                    answer=bundle.abstract.answer,
                    hint=bundle.abstract.hint,
                    order_index=exercise_order
                ))
                exercise_order += 1

        if exercises:
            self.db.add_all(exercises)

        self.db.commit()
        return len(records)

    def get_by_worksheet_id(self, worksheet_id: int) -> List[CPABundle]:
        records = (
            self.db.query(CPABundleRecord)
            .filter(CPABundleRecord.worksheet_id == worksheet_id)
            .order_by(CPABundleRecord.order_index)
            .all()
        )
        bundles: List[CPABundle] = []
        for record in records:
            core_json = json.loads(str(record.math_core_json))
            concrete = json.loads(str(record.concrete_spec_json))
            pictorial = json.loads(str(record.pictorial_spec_json))
            abstract = json.loads(str(record.abstract_spec_json))
            validator_messages = json.loads(str(record.validator_messages_json or "[]"))
            status = cast(ValidationStatus, str(record.validation_status))

            content_family: ContentFamily = "arithmetic"
            family_payload = {}
            math_core: MathCore | None = None

            if isinstance(core_json, dict) and "common" in core_json and "specific" in core_json:
                # Backward compatibility: old records stored only arithmetic math_core.
                math_core = MathCore.model_validate(core_json)
            elif isinstance(core_json, dict):
                content_family = cast(ContentFamily, str(core_json.get("content_family", "arithmetic")))
                family_payload = core_json.get("family_payload", {}) or {}
                maybe_math_core = core_json.get("math_core")
                if isinstance(maybe_math_core, dict):
                    math_core = MathCore.model_validate(maybe_math_core)

            bundle = CPABundle(
                bundle_id=str(record.id),
                content_family=content_family,
                family_payload=family_payload,
                math_core=math_core,
                concrete=concrete,
                pictorial=pictorial,
                abstract=abstract,
                validation_status=status,
                validator_messages=validator_messages,
            )
            bundles.append(bundle)
        return bundles

    def delete_by_worksheet_id(self, worksheet_id: int, commit: bool = True) -> None:
        (
            self.db.query(CPABundleRecord)
            .filter(CPABundleRecord.worksheet_id == worksheet_id)
            .delete(synchronize_session=False)
        )
        if commit:
            self.db.commit()