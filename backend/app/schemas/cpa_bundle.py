"""Schemas for structured CPA bundle generation and persistence."""

from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, model_validator


ValidationSeverity = Literal["info", "warning", "error"]
ValidationStatus = Literal["pending", "passed", "warning", "failed"]
ContentFamily = Literal["arithmetic", "geometry", "measurement", "number_sense", "word_problem", "data_handling"]
OperationFamily = Literal[
    "addition",
    "subtraction",
    "multiplication",
    "division_with_remainder",
]
ManipulativeType = Literal["que_tinh", "vien_bi", "khoi_vuong", "dong_xu", "trai_cay"]
DiagramType = Literal[
    "dot_array",
    "bar_model",
    "number_bond",
    "ten_frame",
    "number_line",
    "segment",
]


class MathCoreCommon(BaseModel):
    topic: str
    grade: Literal[1, 2, 3]
    operation_family: OperationFamily
    difficulty_band: Literal["foundation", "standard", "extension", "advanced"] = "standard"


class MathCoreSpecific(BaseModel):
    operand_a: Optional[int] = None
    operand_b: Optional[int] = None
    result: Optional[int] = None
    dividend: Optional[int] = None
    divisor: Optional[int] = None
    quotient: Optional[int] = None
    remainder: Optional[int] = None


class MathCore(BaseModel):
    common: MathCoreCommon
    specific: MathCoreSpecific

    @model_validator(mode="after")
    def validate_consistency(self) -> "MathCore":
        family = self.common.operation_family
        spec = self.specific

        if family == "division_with_remainder":
            required = [spec.dividend, spec.divisor, spec.quotient, spec.remainder]
            if any(v is None for v in required):
                raise ValueError("division_with_remainder requires dividend, divisor, quotient, remainder")
            if spec.divisor == 0:
                raise ValueError("divisor must be non-zero")
            if spec.remainder is not None and spec.divisor is not None and spec.remainder >= spec.divisor:
                raise ValueError("remainder must be smaller than divisor")
            expected_dividend = (spec.divisor or 0) * (spec.quotient or 0) + (spec.remainder or 0)
            if spec.dividend != expected_dividend:
                raise ValueError("dividend must equal divisor * quotient + remainder")
            return self

        required = [spec.operand_a, spec.operand_b, spec.result]
        if any(v is None for v in required):
            raise ValueError("arithmetic core requires operand_a, operand_b, result")
        if spec.operand_a is None or spec.operand_b is None or spec.result is None:
            raise ValueError("arithmetic core requires operand_a, operand_b, result")

        operand_a = spec.operand_a
        operand_b = spec.operand_b
        result = spec.result

        if family == "addition" and operand_a + operand_b != result:
            raise ValueError("addition operands do not match result")
        if family == "subtraction" and operand_a - operand_b != result:
            raise ValueError("subtraction operands do not match result")
        if family == "multiplication" and operand_a * operand_b != result:
            raise ValueError("multiplication operands do not match result")
        return self

    def primary_numbers(self) -> List[int]:
        if self.common.operation_family == "division_with_remainder":
            return [
                int(self.specific.dividend or 0),
                int(self.specific.divisor or 0),
            ]
        return [
            int(self.specific.operand_a or 0),
            int(self.specific.operand_b or 0),
        ]

    def expected_answer(self) -> str:
        if self.common.operation_family == "division_with_remainder":
            return f"{self.specific.quotient} du {self.specific.remainder}"
        return str(self.specific.result)


class ConcreteGroup(BaseModel):
    label: str
    count: int = Field(..., ge=0)
    color: str = "#4CAF50"


class ConcreteSpec(BaseModel):
    manipulative_type: ManipulativeType
    groups: List[ConcreteGroup] = Field(default_factory=list)
    action_instruction: str
    result_prompt: str
    answer: str


class PictorialGroup(BaseModel):
    count: int = Field(..., ge=0)
    color: str = "#2196F3"
    shape: Literal["circle", "square", "bar"] = "circle"


class PictorialSpec(BaseModel):
    diagram_type: DiagramType
    groups: List[PictorialGroup] = Field(default_factory=list)
    question_text: str
    answer: str
    layout: Literal["horizontal", "vertical"] = "horizontal"
    target: Optional[Literal["whole", "parts"]] = None


class AbstractSpec(BaseModel):
    expression: str
    answer: str
    hint: Optional[str] = None
    show_blank: bool = True


class ValidationIssue(BaseModel):
    code: str
    severity: ValidationSeverity
    message: str
    layer: Optional[Literal["math_core", "concrete", "pictorial", "abstract", "bundle"]] = None


class ValidationResult(BaseModel):
    passed: bool
    status: ValidationStatus
    issues: List[ValidationIssue] = Field(default_factory=list)


class CPABundleRendered(BaseModel):
    concrete_html: Optional[str] = None
    pictorial_svg: Optional[str] = None
    abstract_latex: Optional[str] = None


class CPABundle(BaseModel):
    bundle_id: Optional[str] = None
    content_family: ContentFamily = "arithmetic"
    family_payload: Dict[str, Any] = Field(default_factory=dict)
    math_core: Optional[MathCore] = None
    concrete: ConcreteSpec
    pictorial: PictorialSpec
    abstract: AbstractSpec
    validation_status: ValidationStatus = "pending"
    validator_messages: List[ValidationIssue] = Field(default_factory=list)
    rendered: Optional[CPABundleRendered] = None

    @model_validator(mode="after")
    def validate_core_and_expression(self) -> "CPABundle":
        if self.content_family == "arithmetic":
            if self.math_core is None:
                raise ValueError("arithmetic bundle requires math_core")
            self.family_payload.setdefault("operation_family", self.math_core.common.operation_family)
        elif not self.family_payload:
            raise ValueError("non-arithmetic bundle requires family_payload")

        if self.math_core is None:
            return self

        expression = self.abstract.expression
        for number in self.math_core.primary_numbers():
            if str(number) not in expression:
                raise ValueError("abstract expression must include math_core numbers")
        return self

    def expected_answer(self) -> str:
        if self.content_family == "arithmetic" and self.math_core is not None:
            return self.math_core.expected_answer()
        payload_answer = self.family_payload.get("expected_answer")
        if payload_answer is None:
            return self.abstract.answer
        return str(payload_answer)

    def primary_numbers(self) -> List[int]:
        if self.content_family == "arithmetic" and self.math_core is not None:
            return self.math_core.primary_numbers()

        numbers = self.family_payload.get("primary_numbers")
        if isinstance(numbers, list):
            return [int(item) for item in numbers if isinstance(item, (int, float))]
        return []


class CPABundleGenerationRequest(BaseModel):
    topic_id: int
    grade: Literal[1, 2, 3]
    objective: str
    bundle_count: int = Field(default=3, ge=1, le=8)


class CPABundleGenerationResponse(BaseModel):
    bundles: List[CPABundle]
    rag_sources: List[str] = Field(default_factory=list)
    generation_mode: Literal["bundle-v1", "bundle-v2"] = "bundle-v2"


class SaveCPABundlesRequest(BaseModel):
    bundles: List[CPABundle]


class SaveCPABundlesResponse(BaseModel):
    worksheet_id: int
    saved_count: int
    validation_summary: Dict[str, Any]