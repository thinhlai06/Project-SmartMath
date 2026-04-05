from app.schemas.cpa_bundle import CPABundle
from app.services.ai.cpa_validator import CPABundleValidator


validator = CPABundleValidator()


def _valid_bundle() -> CPABundle:
    return CPABundle.model_validate(
        {
            "math_core": {
                "common": {
                    "topic": "Phep cong trong pham vi 20",
                    "grade": 1,
                    "operation_family": "addition",
                    "difficulty_band": "standard",
                },
                "specific": {"operand_a": 7, "operand_b": 5, "result": 12},
            },
            "concrete": {
                "manipulative_type": "que_tinh",
                "groups": [
                    {"label": "Nhom 1", "count": 7, "color": "#4CAF50"},
                    {"label": "Nhom 2", "count": 5, "color": "#2196F3"},
                ],
                "action_instruction": "Lay bay que tinh va them nam que tinh roi dem tong so que tinh.",
                "result_prompt": "Tat ca co bao nhieu que tinh?",
                "answer": "12",
            },
            "pictorial": {
                "diagram_type": "dot_array",
                "groups": [
                    {"count": 7, "color": "#4CAF50", "shape": "circle"},
                    {"count": 5, "color": "#2196F3", "shape": "circle"},
                ],
                "question_text": "Nhin hinh va tim tong so cham.",
                "answer": "12",
                "layout": "horizontal",
            },
            "abstract": {
                "expression": "7 + 5 = ?",
                "answer": "12",
                "hint": "Dem tiep tu 7",
                "show_blank": True,
            },
        }
    )


def test_validator_passes_valid_bundle():
    bundle = _valid_bundle()
    result = validator.validate(bundle)
    assert result.passed is True
    assert result.status == "passed"


def test_validator_fails_when_concrete_has_math_symbol():
    bundle = _valid_bundle()
    bundle.concrete.action_instruction = "Lay 7 que tinh + 5 que tinh = bao nhieu?"

    result = validator.validate(bundle)
    assert result.passed is False
    assert any(issue.code == "concrete_authenticity.math_symbol" for issue in result.issues)


def test_validator_fails_when_concrete_groups_do_not_match_operands():
    bundle = _valid_bundle()
    bundle.concrete.groups[1].count = 4

    result = validator.validate(bundle)
    assert result.passed is False
    assert any(issue.code == "concrete_authenticity.operand_mismatch" for issue in result.issues)


def test_validator_warns_when_pictorial_question_has_no_visual_cue():
    bundle = _valid_bundle()
    bundle.pictorial.question_text = "Tinh tong hai so sau."

    result = validator.validate(bundle)
    assert result.status in {"warning", "failed"}
    assert any(issue.code == "pictorial_authenticity.missing_visual_cue" for issue in result.issues)


def test_validator_fails_when_dot_array_uses_bar_shape():
    bundle = _valid_bundle()
    bundle.pictorial.groups[0].shape = "bar"

    result = validator.validate(bundle)
    assert result.passed is False
    assert any(issue.code == "pictorial_authenticity.shape_mismatch" for issue in result.issues)