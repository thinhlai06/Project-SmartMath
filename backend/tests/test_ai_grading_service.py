from unittest.mock import Mock

from app.services.ai.grading_service import GradingService


def test_compare_number_answer_type_matches_numeric_value() -> None:
    service = GradingService()

    result = service._compare_answers(
        student="Ket qua la 12",
        expected={"answer": 12, "answer_type": "number"},
    )

    assert result["is_correct"] is True
    assert result["matched_items"] == 1
    assert result["total_items"] == 1


def test_compare_unordered_list_accepts_any_order() -> None:
    service = GradingService()

    result = service._compare_answers(
        student="hinh vuong, tam giac, hinh tron",
        expected={
            "answer": ["tam giac", "hinh tron", "hinh vuong"],
            "answer_type": "unordered_list",
            "grading_rule": "all_or_nothing",
        },
    )

    assert result["is_correct"] is True
    assert result["matched_items"] == 3
    assert result["total_items"] == 3


def test_compare_boolean_supports_vietnamese_values() -> None:
    service = GradingService()

    result = service._compare_answers(
        student="Đúng",
        expected={"answer": True, "answer_type": "boolean"},
    )

    assert result["is_correct"] is True


def test_grade_submission_supports_per_item_scoring() -> None:
    service = GradingService()

    service.ocr = Mock()
    service.ocr.recognize_with_confidence.return_value = {
        "raw_text": "Cau 1: 2, 3, 9",
        "tokens": [],
        "avg_confidence": 0.91,
    }
    service._parse_answers_with_llm = Mock(return_value={"1": "2, 3, 9"})

    result = service.grade_submission(
        image_content=b"fake-image",
        correct_answers=[
            {
                "id": 1,
                "answer_type": "ordered_list",
                "grading_rule": "per_item",
                "answer": ["2", "3", "4"],
                "points": 10,
            }
        ],
    )

    assert result["total_score"] == 7
    assert result["max_score"] == 10
    assert result["results"][0]["is_correct"] is False
    assert result["results"][0]["feedback"] == "Đúng một phần (2/3 ý đúng)."


def test_per_item_ordered_list_penalizes_extra_items() -> None:
    service = GradingService()

    result = service._compare_answers(
        student="1, 2, 3, 4",
        expected={
            "answer": ["1", "2", "3"],
            "answer_type": "ordered_list",
            "grading_rule": "per_item",
        },
    )

    assert result["is_correct"] is False
    assert result["matched_items"] == 3
    assert result["total_items"] == 4


def test_per_item_unordered_list_penalizes_extra_items() -> None:
    service = GradingService()

    result = service._compare_answers(
        student="tam giac, hinh tron, hinh vuong, hinh chu nhat",
        expected={
            "answer": ["tam giac", "hinh tron", "hinh vuong"],
            "answer_type": "unordered_list",
            "grading_rule": "per_item",
        },
    )

    assert result["is_correct"] is False
    assert result["matched_items"] == 3
    assert result["total_items"] == 4


def test_safe_parse_json_array_repairs_trailing_comma() -> None:
    service = GradingService()

    parsed = service._safe_parse_json_array(
        "<think>hidden</think>```json\n[{\"question_id\":\"1\",\"score\":10,}]\n```"
    )

    assert parsed == [{"question_id": "1", "score": 10}]


def test_detect_error_hint_thieu_don_vi() -> None:
    service = GradingService()

    hint = service._detect_error_hint("5", "5 cm", "text")

    assert hint == "thieu_don_vi"


def test_verify_correctness_numeric_and_unknown() -> None:
    service = GradingService()

    assert service._verify_correctness("Ket qua la 12", "12") is True
    assert service._verify_correctness("banh xe", "hinh tron") is None


def test_grade_submission_adds_error_type_and_detail() -> None:
    service = GradingService()

    service.ocr = Mock()
    service.ocr.recognize_with_confidence.return_value = {
        "raw_text": "Cau 1:",
        "tokens": [],
        "avg_confidence": 0.9,
    }
    service._parse_answers_with_llm = Mock(return_value={"1": ""})
    service._enrich_errors_with_llm = Mock(side_effect=lambda results, _raw: results)

    result = service.grade_submission(
        image_content=b"fake-image",
        correct_answers=[{"id": 1, "answer": "5", "answer_type": "text", "points": 10}],
    )

    assert result["results"][0]["is_correct"] is False
    assert result["results"][0]["error_type"] == "bo_sot_cau"
    assert "bỏ sót" in (result["results"][0]["error_detail"] or "").lower()
