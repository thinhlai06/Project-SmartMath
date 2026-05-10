from __future__ import annotations

from collections import defaultdict
from datetime import datetime
from typing import Any

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.models.grade_entry import GradeEntry
from app.models.intervention_plan import InterventionGroup, InterventionPlan, InterventionPlanStatus
from app.models.math_class import MathClass
from app.models.student import Student
from app.models.student_analytics import StudentAnalytics
from app.models.student_progress import StudentProgress
from app.models.worksheet import Worksheet, WorksheetStatus, WorksheetType


DEFAULT_SUGGESTION = {
    "group_name": "Nhóm cần theo dõi thêm",
    "suggested_activity": "Ôn lại kiến thức nền tảng theo từng bước, nhắc học sinh đọc kỹ đề trước khi làm.",
    "suggested_exercises": {"foundation": 6, "standard": 4},
    "duration_minutes": 15,
}


ERROR_TYPE_SUGGESTIONS: dict[str, dict[str, Any]] = {
    "tinh_sai": {
        "group_name": "Cần luyện kỹ năng tính",
        "suggested_activity": "Luyện bằng que tính hoặc bảng chục-đơn vị, nhấn mạnh bước nhớ/trả nhớ.",
        "suggested_exercises": {"foundation": 8, "standard": 4},
        "duration_minutes": 15,
    },
    "nham_phep_tinh": {
        "group_name": "Hay nhầm phép tính",
        "suggested_activity": "Cho học sinh tô màu phép tính và đọc to yêu cầu trước khi làm.",
        "suggested_exercises": {"foundation": 6, "standard": 4},
        "duration_minutes": 12,
    },
    "thieu_don_vi": {
        "group_name": "Hay thiếu đơn vị",
        "suggested_activity": "Gạch chân đơn vị trong đề và yêu cầu viết đơn vị ngay khi đặt phép tính.",
        "suggested_exercises": {"foundation": 4, "standard": 6},
        "duration_minutes": 10,
    },
    "sai_loi_giai": {
        "group_name": "Sai cách trình bày lời giải",
        "suggested_activity": "Viết mẫu lời giải theo khung có sẵn rồi cho học sinh điền từ khóa còn thiếu.",
        "suggested_exercises": {"foundation": 4, "standard": 4, "extension": 2},
        "duration_minutes": 15,
    },
    "doc_de_sai": {
        "group_name": "Hay đọc thiếu dữ kiện",
        "suggested_activity": "Luyện gạch chân dữ kiện và tóm tắt bằng sơ đồ trước khi giải.",
        "suggested_exercises": {"foundation": 5, "standard": 3},
        "duration_minutes": 12,
    },
    "viet_sai_so": {
        "group_name": "Hay viết sai số",
        "suggested_activity": "Luyện viết số theo mẫu, đọc to số trước và sau khi ghi vào bài.",
        "suggested_exercises": {"foundation": 8, "standard": 2},
        "duration_minutes": 10,
    },
    "bo_sot_cau": {
        "group_name": "Hay bỏ sót câu",
        "suggested_activity": "Dạy thói quen đánh dấu ✓ từng câu đã làm để tránh bỏ sót.",
        "suggested_exercises": {"foundation": 6, "standard": 4},
        "duration_minutes": 10,
    },
    "on_tong_quat": {
        "group_name": "Cần ôn lại kiến thức tổng quát",
        "suggested_activity": "Ôn tập ngắn theo chủ đề đã học và kiểm tra lại từng bước giải.",
        "suggested_exercises": {"foundation": 10, "standard": 4},
        "duration_minutes": 20,
    },
    "khac": {
        "group_name": "Nhóm khác cần theo dõi",
        "suggested_activity": "Theo dõi lỗi nhỏ lẻ và giao bài ôn tập ngắn theo nhu cầu từng em.",
        "suggested_exercises": {"foundation": 4, "standard": 2},
        "duration_minutes": 10,
    },
}


class InterventionService:
    def __init__(self, db: Session):
        self.db = db

    def generate_plan(self, class_id: int, week_number: int, year: int, teacher_id: int) -> InterventionPlan:
        self._get_owned_class(class_id, teacher_id)
        week_start, week_end = self._get_school_week_bounds(year, week_number)

        plan = self._find_plan_for_week(class_id, week_number, year)

        if plan and int(plan.teacher_id) != teacher_id:
            raise HTTPException(status_code=403, detail="Bạn không có quyền tạo kế hoạch cho lớp này")

        if plan and self._status_value(plan.status) != InterventionPlanStatus.DRAFT.value:
            raise HTTPException(
                status_code=400,
                detail="Kế hoạch tuần này đã được duyệt hoặc hoàn thành, không thể tạo lại",
            )

        if not plan:
            plan = InterventionPlan(
                class_id=class_id,
                teacher_id=teacher_id,
                week_number=week_number,
                year=year,
                status=InterventionPlanStatus.DRAFT.value,
            )
            self.db.add(plan)
            try:
                self.db.flush()
            except IntegrityError as exc:
                self.db.rollback()
                plan = self._find_plan_for_week(class_id, week_number, year)
                if plan is None:
                    raise HTTPException(
                        status_code=409,
                        detail="Không thể tạo kế hoạch do trùng dữ liệu tuần",
                    ) from exc
        else:
            self.db.query(InterventionGroup).filter(InterventionGroup.plan_id == plan.id).delete()
            plan.updated_at = datetime.utcnow()

        groups_payload = self._build_groups(class_id, teacher_id, week_start, week_end)
        for group_payload in groups_payload:
            self.db.add(
                InterventionGroup(
                    plan_id=plan.id,
                    group_name=group_payload["group_name"],
                    error_type=group_payload["error_type"],
                    evidence=group_payload["evidence"],
                    suggested_activity=group_payload["suggested_activity"],
                    suggested_exercises=group_payload["suggested_exercises"],
                    duration_minutes=group_payload["duration_minutes"],
                    student_ids=group_payload["student_ids"],
                    order_index=group_payload["order_index"],
                )
            )

        self.db.commit()
        return self._load_plan(plan.id)

    def get_plan(self, plan_id: int, teacher_id: int) -> InterventionPlan:
        plan = self._load_plan(plan_id)
        if int(plan.teacher_id) != teacher_id:
            raise HTTPException(status_code=403, detail="Bạn không có quyền xem kế hoạch này")
        return plan

    def get_plans_for_class(self, class_id: int, teacher_id: int, limit: int = 20) -> list[InterventionPlan]:
        self._get_owned_class(class_id, teacher_id)
        return (
            self.db.query(InterventionPlan)
            .options(joinedload(InterventionPlan.groups))
            .filter(InterventionPlan.class_id == class_id)
            .order_by(InterventionPlan.year.desc(), InterventionPlan.week_number.desc(), InterventionPlan.created_at.desc())
            .limit(limit)
            .all()
        )

    def approve_plan(self, plan_id: int, teacher_id: int, notes: str | None = None) -> InterventionPlan:
        plan = self.get_plan(plan_id, teacher_id)
        if self._status_value(plan.status) == InterventionPlanStatus.COMPLETED.value:
            raise HTTPException(status_code=400, detail="Kế hoạch đã hoàn thành, không thể duyệt lại")

        plan.status = InterventionPlanStatus.APPROVED.value
        plan.approved_at = datetime.utcnow()
        if notes is not None:
            plan.notes = notes

        self.db.commit()
        return self._load_plan(plan.id)

    def complete_plan(self, plan_id: int, teacher_id: int) -> InterventionPlan:
        plan = self.get_plan(plan_id, teacher_id)
        if self._status_value(plan.status) == InterventionPlanStatus.DRAFT.value:
            raise HTTPException(status_code=400, detail="Vui lòng duyệt kế hoạch trước khi hoàn thành")

        plan.status = InterventionPlanStatus.COMPLETED.value
        self.db.commit()
        return self._load_plan(plan.id)

    def update_group(self, group_id: int, teacher_id: int, updates: dict[str, Any]) -> InterventionGroup:
        group = self._get_owned_group(group_id, teacher_id)

        if "suggested_activity" in updates and updates["suggested_activity"] is not None:
            group.suggested_activity = str(updates["suggested_activity"])
        if "suggested_exercises" in updates and updates["suggested_exercises"] is not None:
            group.suggested_exercises = dict(updates["suggested_exercises"])
        if "duration_minutes" in updates and updates["duration_minutes"] is not None:
            group.duration_minutes = int(updates["duration_minutes"])
        if "notes" in updates:
            group.notes = updates["notes"]

        self.db.commit()
        self.db.refresh(group)
        return group

    def link_worksheet_to_group(self, group_id: int, worksheet_id: int, teacher_id: int) -> InterventionGroup:
        group = self._get_owned_group(group_id, teacher_id)

        worksheet = (
            self.db.query(Worksheet)
            .join(MathClass, Worksheet.class_id == MathClass.id)
            .filter(
                Worksheet.id == worksheet_id,
                Worksheet.class_id == group.plan.class_id,
                Worksheet.grade == group.plan.math_class.grade,
                Worksheet.worksheet_type == WorksheetType.DIFFERENTIATION.value,
                Worksheet.status == WorksheetStatus.DRAFT.value,
                MathClass.teacher_id == teacher_id,
            )
            .first()
        )
        if worksheet is None:
            raise HTTPException(status_code=400, detail="Chỉ có thể gắn bài tập phân hóa dạng nháp thuộc đúng lớp")

        group.worksheet_id = worksheet_id
        self.db.commit()
        self.db.refresh(group)
        return group

    def delete_plan(self, plan_id: int, teacher_id: int) -> None:
        plan = self.get_plan(plan_id, teacher_id)
        if self._status_value(plan.status) != InterventionPlanStatus.DRAFT.value:
            raise HTTPException(status_code=400, detail="Chỉ có thể xóa kế hoạch ở trạng thái nháp")

        self.db.delete(plan)
        self.db.commit()

    def serialize_plan(self, plan: InterventionPlan) -> dict[str, Any]:
        student_name_map = self._student_name_map(plan.class_id)
        groups = [self.serialize_group(group, student_name_map) for group in sorted(plan.groups, key=lambda item: item.order_index)]
        total_students = len({student_id for group in groups for student_id in group["student_ids"]})

        math_class = plan.math_class
        if math_class is None:
            math_class = self.db.query(MathClass).filter(MathClass.id == plan.class_id).first()

        return {
            "id": plan.id,
            "class_id": plan.class_id,
            "class_name": math_class.class_name if math_class else "",
            "grade": math_class.grade if math_class else 1,
            "week_number": plan.week_number,
            "year": plan.year,
            "status": self._status_value(plan.status),
            "notes": plan.notes,
            "groups": groups,
            "total_students": total_students,
            "created_at": plan.created_at,
            "approved_at": plan.approved_at,
        }

    def serialize_plan_list_item(self, plan: InterventionPlan) -> dict[str, Any]:
        group_student_ids = []
        for group in plan.groups:
            group_student_ids.extend([int(item) for item in (group.student_ids or [])])

        return {
            "id": plan.id,
            "week_number": plan.week_number,
            "year": plan.year,
            "status": self._status_value(plan.status),
            "total_groups": len(plan.groups),
            "total_students": len(set(group_student_ids)),
            "created_at": plan.created_at,
        }

    def serialize_group(self, group: InterventionGroup, student_name_map: dict[int, str]) -> dict[str, Any]:
        student_ids = [int(item) for item in (group.student_ids or [])]
        return {
            "id": group.id,
            "group_name": group.group_name,
            "error_type": group.error_type,
            "evidence": list(group.evidence or []),
            "suggested_activity": group.suggested_activity,
            "suggested_exercises": dict(group.suggested_exercises or {}),
            "duration_minutes": group.duration_minutes,
            "student_ids": student_ids,
            "student_names": [student_name_map[item] for item in student_ids if item in student_name_map],
            "worksheet_id": group.worksheet_id,
            "order_index": group.order_index,
            "notes": group.notes,
        }

    def get_student_name_map(self, class_id: int) -> dict[int, str]:
        return self._student_name_map(class_id)

    def _build_groups(
        self,
        class_id: int,
        teacher_id: int,
        week_start: datetime,
        week_end: datetime,
    ) -> list[dict[str, Any]]:
        students = self.db.query(Student).filter(Student.class_id == class_id).all()
        student_name_map = {int(student.id): student.full_name for student in students}
        if not students:
            return []

        latest_worksheet_ids = self._get_latest_school_week_worksheet_ids(class_id, week_start, week_end)
        analytics_filters = [
            StudentAnalytics.class_id == class_id,
            StudentAnalytics.teacher_id == teacher_id,
            StudentAnalytics.student_id.isnot(None),
            StudentAnalytics.created_at >= week_start,
            StudentAnalytics.created_at < week_end,
        ]
        if latest_worksheet_ids:
            analytics_filters.append(StudentAnalytics.worksheet_id.in_(latest_worksheet_ids))

        analytics_rows = (
            self.db.query(StudentAnalytics)
            .filter(*analytics_filters)
            .order_by(StudentAnalytics.created_at.desc())
            .all()
        )

        counts_by_error_and_student: dict[str, dict[int, int]] = defaultdict(lambda: defaultdict(int))
        evidence_by_error: dict[str, list[dict[str, Any]]] = defaultdict(list)

        for row in analytics_rows:
            if row.student_id is None:
                continue
            student_id = int(row.student_id)
            error_type = (row.error_type or "khac").strip() or "khac"
            counts_by_error_and_student[error_type][student_id] += int(row.count or 1)

            payload = row.payload if isinstance(row.payload, dict) else {}
            evidence_by_error[error_type].append(
                {
                    "student_id": student_id,
                    "student_name": student_name_map.get(student_id, ""),
                    "question_text": payload.get("question_text") if isinstance(payload, dict) else None,
                    "student_answer": payload.get("student_answer") if isinstance(payload, dict) else None,
                    "correct_answer": payload.get("correct_answer") if isinstance(payload, dict) else None,
                    "created_at": row.created_at.isoformat() if row.created_at else "",
                }
            )

        groups: list[dict[str, Any]] = []
        assigned_student_ids: set[int] = set()

        for error_type, student_counts in counts_by_error_and_student.items():
            qualified_student_ids = sorted(student_id for student_id, total in student_counts.items() if total >= 2)
            if not qualified_student_ids:
                continue

            suggestion = ERROR_TYPE_SUGGESTIONS.get(error_type, DEFAULT_SUGGESTION)
            evidence = [item for item in evidence_by_error.get(error_type, []) if item["student_id"] in qualified_student_ids][:3]
            groups.append(
                {
                    "error_type": error_type,
                    "group_name": suggestion["group_name"],
                    "suggested_activity": suggestion["suggested_activity"],
                    "suggested_exercises": suggestion["suggested_exercises"],
                    "duration_minutes": suggestion["duration_minutes"],
                    "student_ids": qualified_student_ids,
                    "evidence": evidence,
                }
            )
            assigned_student_ids.update(qualified_student_ids)

        low_score_students = self._get_low_score_students(class_id, week_start, week_end)
        low_score_unassigned = sorted(student_id for student_id in low_score_students if student_id not in assigned_student_ids)
        if low_score_unassigned:
            suggestion = ERROR_TYPE_SUGGESTIONS["on_tong_quat"]
            groups.append(
                {
                    "error_type": "on_tong_quat",
                    "group_name": suggestion["group_name"],
                    "suggested_activity": suggestion["suggested_activity"],
                    "suggested_exercises": suggestion["suggested_exercises"],
                    "duration_minutes": suggestion["duration_minutes"],
                    "student_ids": low_score_unassigned,
                    "evidence": [],
                }
            )

        groups = self._merge_small_groups(groups)
        groups.sort(key=lambda item: len(item["student_ids"]), reverse=True)
        groups = groups[:5]

        for index, group in enumerate(groups):
            group["order_index"] = index

        return groups

    def _merge_small_groups(self, groups: list[dict[str, Any]]) -> list[dict[str, Any]]:
        normal_groups = [group for group in groups if len(group["student_ids"]) >= 2]
        small_groups = [group for group in groups if len(group["student_ids"]) < 2]

        if not small_groups:
            return normal_groups

        merged_student_ids: list[int] = []
        merged_evidence: list[dict[str, Any]] = []
        for group in small_groups:
            merged_student_ids.extend(group["student_ids"])
            merged_evidence.extend(group["evidence"])

        if not merged_student_ids:
            return normal_groups

        suggestion = ERROR_TYPE_SUGGESTIONS["khac"]
        merged_group = {
            "error_type": "khac",
            "group_name": suggestion["group_name"],
            "suggested_activity": suggestion["suggested_activity"],
            "suggested_exercises": suggestion["suggested_exercises"],
            "duration_minutes": suggestion["duration_minutes"],
            "student_ids": sorted(set(merged_student_ids)),
            "evidence": merged_evidence[:3],
        }
        normal_groups.append(merged_group)
        return normal_groups

    def _get_low_score_students(self, class_id: int, week_start: datetime, week_end: datetime) -> set[int]:
        score_map: dict[int, list[float]] = defaultdict(list)

        grade_rows = (
            self.db.query(GradeEntry.student_id, GradeEntry.score)
            .join(Student, Student.id == GradeEntry.student_id)
            .join(Worksheet, Worksheet.id == GradeEntry.worksheet_id)
            .filter(
                Student.class_id == class_id,
                Worksheet.class_id == class_id,
                GradeEntry.updated_at >= week_start,
                GradeEntry.updated_at < week_end,
            )
            .all()
        )

        for student_id, score in grade_rows:
            score_map[int(student_id)].append(float(score))

        progress_rows = (
            self.db.query(StudentProgress)
            .join(Student, Student.id == StudentProgress.student_id)
            .join(Worksheet, Worksheet.id == StudentProgress.worksheet_id)
            .filter(
                Student.class_id == class_id,
                Worksheet.class_id == class_id,
                StudentProgress.completed_at.isnot(None),
                StudentProgress.completed_at >= week_start,
                StudentProgress.completed_at < week_end,
            )
            .all()
        )

        for progress in progress_rows:
            student_id = int(progress.student_id)
            if score_map.get(student_id):
                continue
            if int(progress.total_count or 0) <= 0:
                continue
            score = round((int(progress.correct_count or 0) / int(progress.total_count)) * 10, 2)
            score_map[student_id].append(score)

        low_score_students: set[int] = set()
        for student_id, scores in score_map.items():
            if not scores:
                continue
            average_score = sum(scores) / len(scores)
            if average_score <= 5.0:
                low_score_students.add(student_id)

        return low_score_students

    def _student_name_map(self, class_id: int) -> dict[int, str]:
        rows = self.db.query(Student.id, Student.full_name).filter(Student.class_id == class_id).all()
        return {int(student_id): full_name for student_id, full_name in rows}

    def _find_plan_for_week(self, class_id: int, week_number: int, year: int) -> InterventionPlan | None:
        return (
            self.db.query(InterventionPlan)
            .filter(
                InterventionPlan.class_id == class_id,
                InterventionPlan.week_number == week_number,
                InterventionPlan.year == year,
            )
            .first()
        )

    def _get_latest_school_week_worksheet_ids(
        self,
        class_id: int,
        week_start: datetime,
        week_end: datetime,
    ) -> list[int]:
        rows = (
            self.db.query(Worksheet.id)
            .filter(
                Worksheet.class_id == class_id,
                Worksheet.created_at >= week_start,
                Worksheet.created_at < week_end,
            )
            .order_by(Worksheet.created_at.desc(), Worksheet.id.desc())
            .limit(2)
            .all()
        )
        return [int(row[0]) for row in rows]

    def _load_plan(self, plan_id: int) -> InterventionPlan:
        plan = (
            self.db.query(InterventionPlan)
            .options(joinedload(InterventionPlan.groups), joinedload(InterventionPlan.math_class))
            .filter(InterventionPlan.id == plan_id)
            .first()
        )
        if plan is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy kế hoạch can thiệp")
        return plan

    def _get_owned_class(self, class_id: int, teacher_id: int) -> MathClass:
        math_class = self.db.query(MathClass).filter(MathClass.id == class_id).first()
        if math_class is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")
        if int(math_class.teacher_id) != teacher_id:
            raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập lớp học này")
        if int(math_class.grade) not in (1, 2, 3):
            raise HTTPException(status_code=400, detail="Kế hoạch can thiệp chỉ hỗ trợ lớp 1 đến lớp 3")
        return math_class

    def _get_owned_group(self, group_id: int, teacher_id: int) -> InterventionGroup:
        group = (
            self.db.query(InterventionGroup)
            .options(joinedload(InterventionGroup.plan).joinedload(InterventionPlan.math_class))
            .filter(InterventionGroup.id == group_id)
            .first()
        )
        if group is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhóm can thiệp")
        if int(group.plan.teacher_id) != teacher_id:
            raise HTTPException(status_code=403, detail="Bạn không có quyền chỉnh sửa nhóm này")
        return group

    def _get_school_week_bounds(self, year: int, week_number: int) -> tuple[datetime, datetime]:
        try:
            start = datetime.fromisocalendar(year, week_number, 1)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Tuần không hợp lệ theo lịch ISO") from exc
        end = datetime.fromisocalendar(year, week_number, 7)
        return start, end

    def _status_value(self, status: InterventionPlanStatus | str) -> str:
        if isinstance(status, InterventionPlanStatus):
            return status.value
        return str(status)
