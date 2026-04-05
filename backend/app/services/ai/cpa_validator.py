"""Pedagogical validator for CPA bundles."""

from __future__ import annotations

import re
from typing import List

from app.schemas.cpa_bundle import CPABundle, ValidationIssue, ValidationResult


_MATH_SYMBOL_PATTERN = re.compile(r"[+\-=xX*/:×÷]")
_AI_STYLE_PATTERN = re.compile(r"hay cung|tuong tuong|kham pha", flags=re.IGNORECASE)
_COLOR_PATTERN = re.compile(r"^#(?:[0-9a-fA-F]{3}){1,2}$")
_PICTORIAL_CUE_PATTERN = re.compile(r"hinh|so do|khung|thanh|cham|doan", flags=re.IGNORECASE)
_CONCRETE_VOCAB = {
    "que_tinh": ["que", "tinh"],
    "vien_bi": ["vien", "bi"],
    "khoi_vuong": ["khoi", "vuong"],
    "dong_xu": ["dong", "xu"],
    "trai_cay": ["trai", "qua", "tao", "cam", "chuoi"],
}


class CPABundleValidator:
    """Validate bundle consistency and layer authenticity."""

    allowed_diagrams = {
        "dot_array",
        "bar_model",
        "number_bond",
        "ten_frame",
        "number_line",
        "segment",
    }

    def validate(self, bundle: CPABundle) -> ValidationResult:
        issues: List[ValidationIssue] = []
        issues.extend(self._check_math_consistency(bundle))
        issues.extend(self._check_concrete_authenticity(bundle))
        issues.extend(self._check_pictorial_authenticity(bundle))
        issues.extend(self._check_abstract_authenticity(bundle))
        issues.extend(self._check_cognitive_progression(bundle))
        issues.extend(self._check_grade_appropriateness(bundle))
        issues.extend(self._check_renderability(bundle))
        issues.extend(self._check_visual_feasibility(bundle))
        issues.extend(self._check_linguistic_appropriateness(bundle))

        has_error = any(issue.severity == "error" for issue in issues)
        has_warning = any(issue.severity == "warning" for issue in issues)
        status = "failed" if has_error else "warning" if has_warning else "passed"
        return ValidationResult(passed=not has_error, status=status, issues=issues)

    def _check_math_consistency(self, bundle: CPABundle) -> List[ValidationIssue]:
        issues: List[ValidationIssue] = []
        expected = self._normalize_answer(bundle.expected_answer())

        concrete_answer = self._normalize_answer(bundle.concrete.answer)
        pictorial_answer = self._normalize_answer(bundle.pictorial.answer)
        abstract_answer = self._normalize_answer(bundle.abstract.answer)
        answers = [concrete_answer, pictorial_answer, abstract_answer]

        if any(answer != expected for answer in answers):
            issues.append(
                ValidationIssue(
                    code="math_consistency.answer_mismatch",
                    severity="error",
                    layer="math_core",
                    message="Answers across concrete/pictorial/abstract must match math_core.",
                )
            )

        if bundle.content_family == "arithmetic":
            for number in bundle.primary_numbers():
                if str(number) not in bundle.abstract.expression:
                    issues.append(
                        ValidationIssue(
                            code="math_consistency.expression_numbers",
                            severity="error",
                            layer="abstract",
                            message="Abstract expression must include core numbers.",
                        )
                    )
                    break
        elif not bundle.family_payload.get("task"):
            issues.append(
                ValidationIssue(
                    code="math_consistency.missing_family_task",
                    severity="warning",
                    layer="bundle",
                    message="Non-arithmetic bundle should define family_payload.task.",
                )
            )

        return issues

    def _check_concrete_authenticity(self, bundle: CPABundle) -> List[ValidationIssue]:
        spec = bundle.concrete
        issues: List[ValidationIssue] = []
        core = bundle.math_core

        if _MATH_SYMBOL_PATTERN.search(spec.action_instruction):
            issues.append(
                ValidationIssue(
                    code="concrete_authenticity.math_symbol",
                    severity="error",
                    layer="concrete",
                    message="Concrete layer must avoid explicit math symbols.",
                )
            )

        if not spec.groups:
            issues.append(
                ValidationIssue(
                    code="concrete_authenticity.missing_groups",
                    severity="error",
                    layer="concrete",
                    message="Concrete layer must define manipulatives groups.",
                )
            )

        if len(spec.action_instruction.split()) < 8:
            issues.append(
                ValidationIssue(
                    code="concrete_authenticity.short_instruction",
                    severity="warning",
                    layer="concrete",
                    message="Concrete instruction is too short for classroom guidance.",
                )
            )

        text_blob = f"{spec.action_instruction} {spec.result_prompt}".lower()
        vocab = _CONCRETE_VOCAB.get(spec.manipulative_type, [])
        if vocab and not any(token in text_blob for token in vocab):
            issues.append(
                ValidationIssue(
                    code="concrete_authenticity.missing_manipulative_vocabulary",
                    severity="warning",
                    layer="concrete",
                    message="Concrete text should mention the chosen manipulative type.",
                )
            )

        if any(not _COLOR_PATTERN.match(group.color or "") for group in spec.groups):
            issues.append(
                ValidationIssue(
                    code="concrete_authenticity.invalid_color",
                    severity="warning",
                    layer="concrete",
                    message="Concrete groups should use valid hex color values.",
                )
            )

        if core is not None and core.common.operation_family in {"addition", "subtraction"}:
            expected = core.primary_numbers()
            if len(spec.groups) < 2:
                issues.append(
                    ValidationIssue(
                        code="concrete_authenticity.insufficient_groups",
                        severity="error",
                        layer="concrete",
                        message="Concrete layer needs at least 2 groups for this operation.",
                    )
                )
            elif [spec.groups[0].count, spec.groups[1].count] != expected:
                issues.append(
                    ValidationIssue(
                        code="concrete_authenticity.operand_mismatch",
                        severity="error",
                        layer="concrete",
                        message="Concrete group counts must match math_core operands.",
                    )
                )

        if core is not None and core.common.operation_family == "multiplication":
            expected_result = core.specific.result or 0
            actual_total = sum(group.count for group in spec.groups)
            if expected_result > 0 and actual_total != expected_result:
                issues.append(
                    ValidationIssue(
                        code="concrete_authenticity.total_mismatch",
                        severity="warning",
                        layer="concrete",
                        message="Concrete total should align with multiplication result.",
                    )
                )

        if core is not None and core.common.operation_family == "division_with_remainder":
            dividend = core.specific.dividend or 0
            if dividend > 0 and sum(group.count for group in spec.groups) < dividend:
                issues.append(
                    ValidationIssue(
                        code="concrete_authenticity.division_quantity_low",
                        severity="warning",
                        layer="concrete",
                        message="Concrete quantity is low for division-with-remainder scenario.",
                    )
                )

        return issues

    def _check_pictorial_authenticity(self, bundle: CPABundle) -> List[ValidationIssue]:
        spec = bundle.pictorial
        issues: List[ValidationIssue] = []
        core = bundle.math_core

        if spec.diagram_type not in self.allowed_diagrams:
            issues.append(
                ValidationIssue(
                    code="pictorial_authenticity.diagram_type",
                    severity="error",
                    layer="pictorial",
                    message="Pictorial layer must use an allowed diagram type.",
                )
            )

        if not spec.groups:
            issues.append(
                ValidationIssue(
                    code="pictorial_authenticity.missing_groups",
                    severity="error",
                    layer="pictorial",
                    message="Pictorial layer must include drawable groups.",
                )
            )

        if any(not _COLOR_PATTERN.match(group.color or "") for group in spec.groups):
            issues.append(
                ValidationIssue(
                    code="pictorial_authenticity.invalid_color",
                    severity="warning",
                    layer="pictorial",
                    message="Pictorial groups should use valid hex color values.",
                )
            )

        if not _PICTORIAL_CUE_PATTERN.search(spec.question_text or ""):
            issues.append(
                ValidationIssue(
                    code="pictorial_authenticity.missing_visual_cue",
                    severity="warning",
                    layer="pictorial",
                    message="Pictorial question should reference visual cues (hinh/so do/khung).",
                )
            )

        if spec.diagram_type in {"dot_array", "number_bond", "ten_frame", "number_line", "segment"}:
            if any(group.shape == "bar" for group in spec.groups):
                issues.append(
                    ValidationIssue(
                        code="pictorial_authenticity.shape_mismatch",
                        severity="error",
                        layer="pictorial",
                        message="Selected diagram type should not use bar-shaped elements.",
                    )
                )

        if spec.diagram_type == "bar_model" and any(group.shape != "bar" for group in spec.groups):
            issues.append(
                ValidationIssue(
                    code="pictorial_authenticity.prefer_bar_shape",
                    severity="warning",
                    layer="pictorial",
                    message="bar_model should prefer bar shapes for clarity.",
                )
            )

        if core is not None and core.common.operation_family in {"addition", "subtraction"} and len(spec.groups) >= 2:
            expected = core.primary_numbers()
            actual = [spec.groups[0].count, spec.groups[1].count]
            if actual != expected:
                issues.append(
                    ValidationIssue(
                        code="pictorial_authenticity.operand_mismatch",
                        severity="error",
                        layer="pictorial",
                        message="Pictorial groups must align with math_core operands.",
                    )
                )

        return issues

    def _check_abstract_authenticity(self, bundle: CPABundle) -> List[ValidationIssue]:
        spec = bundle.abstract
        issues: List[ValidationIssue] = []

        if bundle.content_family == "arithmetic" and not re.search(r"\d", spec.expression):
            issues.append(
                ValidationIssue(
                    code="abstract_authenticity.non_numeric_expression",
                    severity="error",
                    layer="abstract",
                    message="Abstract expression must contain numbers.",
                )
            )

        if not spec.answer.strip():
            issues.append(
                ValidationIssue(
                    code="abstract_authenticity.empty_answer",
                    severity="error",
                    layer="abstract",
                    message="Abstract answer must not be empty.",
                )
            )

        return issues

    def _check_cognitive_progression(self, bundle: CPABundle) -> List[ValidationIssue]:
        issues: List[ValidationIssue] = []

        if _MATH_SYMBOL_PATTERN.search(bundle.concrete.action_instruction):
            issues.append(
                ValidationIssue(
                    code="cognitive_progression.concrete_leak",
                    severity="error",
                    layer="concrete",
                    message="Concrete layer leaks abstract notation.",
                )
            )

        if not bundle.pictorial.diagram_type:
            issues.append(
                ValidationIssue(
                    code="cognitive_progression.missing_pictorial",
                    severity="error",
                    layer="pictorial",
                    message="Pictorial layer requires a diagram type.",
                )
            )

        return issues

    def _check_grade_appropriateness(self, bundle: CPABundle) -> List[ValidationIssue]:
        issues: List[ValidationIssue] = []
        grade = bundle.math_core.common.grade if bundle.math_core is not None else bundle.family_payload.get("grade") or 1
        family = bundle.math_core.common.operation_family if bundle.math_core is not None else "non_arithmetic"

        if bundle.math_core is None:
            question_length = len((bundle.pictorial.question_text or "").split())
            if grade == 1 and question_length > 20:
                issues.append(
                    ValidationIssue(
                        code="grade_appropriateness.grade1_text_too_long",
                        severity="warning",
                        layer="pictorial",
                        message="Grade 1 non-arithmetic questions should remain short.",
                    )
                )
            return issues

        if family == "division_with_remainder":
            result_value = bundle.math_core.specific.quotient or 0
        else:
            result_value = bundle.math_core.specific.result or 0

        if grade == 1 and result_value > 20:
            issues.append(
                ValidationIssue(
                    code="grade_appropriateness.grade1_limit",
                    severity="error",
                    layer="math_core",
                    message="Grade 1 results should stay within 20.",
                )
            )
        if grade == 2 and family == "addition" and result_value > 100:
            issues.append(
                ValidationIssue(
                    code="grade_appropriateness.grade2_addition_limit",
                    severity="error",
                    layer="math_core",
                    message="Grade 2 addition should stay within 100.",
                )
            )
        if grade == 2 and family == "division_with_remainder":
            dividend = bundle.math_core.specific.dividend or 0
            if dividend > 50:
                issues.append(
                    ValidationIssue(
                        code="grade_appropriateness.grade2_division_limit",
                        severity="error",
                        layer="math_core",
                        message="Grade 2 division-with-remainder should stay within 50.",
                    )
                )
        if grade == 3 and result_value > 100000:
            issues.append(
                ValidationIssue(
                    code="grade_appropriateness.grade3_limit",
                    severity="error",
                    layer="math_core",
                    message="Grade 3 value exceeds configured upper bound.",
                )
            )

        return issues

    def _check_renderability(self, bundle: CPABundle) -> List[ValidationIssue]:
        issues: List[ValidationIssue] = []
        spec = bundle.pictorial

        if spec.diagram_type == "bar_model" and len(spec.groups) < 2:
            issues.append(
                ValidationIssue(
                    code="renderability.bar_model_groups",
                    severity="error",
                    layer="pictorial",
                    message="bar_model requires at least 2 groups.",
                )
            )

        if spec.diagram_type == "number_bond" and spec.target is None:
            issues.append(
                ValidationIssue(
                    code="renderability.number_bond_target",
                    severity="error",
                    layer="pictorial",
                    message="number_bond should specify target whole/parts.",
                )
            )

        if spec.diagram_type == "ten_frame":
            if any(group.count > 20 for group in spec.groups):
                issues.append(
                    ValidationIssue(
                        code="renderability.ten_frame_range",
                        severity="error",
                        layer="pictorial",
                        message="ten_frame does not support groups larger than 20 in MVP renderer.",
                    )
                )

        return issues

    def _check_visual_feasibility(self, bundle: CPABundle) -> List[ValidationIssue]:
        spec = bundle.pictorial
        if spec.diagram_type != "dot_array":
            return []

        total = sum(group.count for group in spec.groups)
        if total <= 60:
            return []

        return [
            ValidationIssue(
                code="visual_feasibility.dot_density",
                severity="warning",
                layer="pictorial",
                message="dot_array may be too dense for clean rendering.",
            )
        ]

    def _check_linguistic_appropriateness(self, bundle: CPABundle) -> List[ValidationIssue]:
        issues: List[ValidationIssue] = []

        for layer, text in [
            ("concrete", bundle.concrete.action_instruction),
            ("pictorial", bundle.pictorial.question_text),
        ]:
            if _AI_STYLE_PATTERN.search(text or ""):
                issues.append(
                    ValidationIssue(
                        code="linguistic.ai_style_phrase",
                        severity="warning",
                        layer=layer,  # type: ignore[arg-type]
                        message="Text contains generic AI-style phrase.",
                    )
                )
            if len((text or "").split()) > 45:
                issues.append(
                    ValidationIssue(
                        code="linguistic.too_long",
                        severity="error",
                        layer=layer,  # type: ignore[arg-type]
                        message="Instruction text is too long for primary students.",
                    )
                )

        return issues

    def _normalize_answer(self, answer: str) -> str:
        return re.sub(r"\s+", " ", (answer or "").strip().lower())