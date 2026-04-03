from __future__ import annotations

from app.services.ai.question_generator import QuestionGenerator


def test_parse_ladder_json_object_content() -> None:
    generator = QuestionGenerator()
    raw = '{"content":{"foundation":[{"question":"Cau 1?","answer":"1","hint":""}],"standard":[],"extension":[],"advanced":[]}}'

    parsed = generator._parse_ladder_json(raw, ["foundation", "standard", "extension", "advanced"])

    assert len(parsed["foundation"]) == 1
    assert parsed["foundation"][0]["question"] == "Cau 1?"


def test_validate_ladder_flags_geometry_topic_drift() -> None:
    generator = QuestionGenerator()
    content = {
        "foundation": [{"question": "Tinh 2 + 3 = ?", "answer": "5", "hint": ""}],
        "standard": [{"question": "Tinh 4 + 1 = ?", "answer": "5", "hint": ""}],
        "extension": [{"question": "Tinh 6 + 2 = ?", "answer": "8", "hint": ""}],
        "advanced": [{"question": "Tinh 8 + 2 = ?", "answer": "10", "hint": ""}],
    }

    summary = generator._validate_ladder(
        content=content,
        topic="Hình học cơ bản",
        grade=1,
        tiers=["foundation", "standard", "extension", "advanced"],
    )

    assert summary["passes"] is False
    assert any("lech topic" in issue["reason"] for issue in summary["issues"])


def test_validate_ladder_flags_duplicate_advanced() -> None:
    generator = QuestionGenerator()
    ext_question = "Lan co 12 cai keo, chia deu moi ban 5 cai. Con du bao nhieu?"
    content = {
        "foundation": [{"question": "12 : 5 = ?", "answer": "2 du 2", "hint": ""}],
        "standard": [{"question": "Chia 17 keo cho 4 ban, con du bao nhieu?", "answer": "du 1", "hint": ""}],
        "extension": [{"question": ext_question, "answer": "2 du 2", "hint": ""}],
        "advanced": [{"question": ext_question, "answer": "2 du 2", "hint": ""}],
    }

    summary = generator._validate_ladder(
        content=content,
        topic="Phép chia có dư",
        grade=3,
        tiers=["foundation", "standard", "extension", "advanced"],
    )

    assert summary["passes"] is False
    assert any("Advanced trung cau truc" in issue["reason"] for issue in summary["issues"])
