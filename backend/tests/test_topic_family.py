from app.services.ai.topic_family import (
    build_topic_generation_metadata,
    resolve_arithmetic_operation_family,
    resolve_content_family,
)


def test_resolve_content_family_from_category():
    assert resolve_content_family("Số học") == "arithmetic"
    assert resolve_content_family("Hình học") == "geometry"
    assert resolve_content_family("Đo lường") == "measurement"


def test_resolve_arithmetic_operation_family():
    assert resolve_arithmetic_operation_family("Phép cộng trong phạm vi 20") == "addition"
    assert resolve_arithmetic_operation_family("Phép trừ có nhớ trong phạm vi 100") == "subtraction"
    assert resolve_arithmetic_operation_family("Bảng nhân 6, 7, 8, 9") == "multiplication"
    assert resolve_arithmetic_operation_family("Phép chia có dư") == "division_with_remainder"
    assert resolve_arithmetic_operation_family("Các số đến 100") is None


def test_build_topic_generation_metadata():
    metadata = build_topic_generation_metadata(
        topic_name="Phép cộng trong phạm vi 20",
        category="Số học",
    )

    assert metadata.topic_slug == "phep_cong_trong_pham_vi_20"
    assert metadata.content_family == "arithmetic"
    assert metadata.operation_family == "addition"
