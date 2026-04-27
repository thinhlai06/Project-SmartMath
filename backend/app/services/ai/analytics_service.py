from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.models.student_progress import StudentProgress
from app.models.student_analytics import StudentAnalytics
from app.models.math_class import MathClass
from app.models.student import Student
from app.models.worksheet import Worksheet
from app.models.math_topic import MathTopic

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def analyze_class_errors(self, class_id: int) -> Dict[str, Any]:
        """
        Analyze errors for a specific class based on student progress.
        """
        analytics_rows = (
            self.db.query(StudentAnalytics)
            .filter(StudentAnalytics.class_id == class_id)
            .all()
        )

        # 1. Fetch all progress for this class
        # Join Student to filter by class_id
        # Join Worksheet to get topic info
        progress_list = (
            self.db.query(StudentProgress)
            .join(Student)
            .join(Worksheet)
            .filter(Student.class_id == class_id)
            .all()
        )
        
        if not progress_list and not analytics_rows:
            return {
                "weak_topics": [],
                "student_performance": [],
                "common_mistakes": []
            }

        # 2. Aggregation Structures
        topic_stats = {}  # topic_name -> {total: 0, correct: 0}
        student_stats = {} # student_name -> {total_score: 0, max_score: 0, worksheets: 0}
        mistake_patterns = {} # question_type -> count

        # 3. Process each submission
        for p in progress_list:
            # Student Stats
            s_name = p.student.full_name
            if s_name not in student_stats:
                student_stats[s_name] = {"total_score": 0, "max_score": 0, "worksheets": 0}
            
            # Estimate max score if not stored (default 10 * total_count?) 
            # Ideally total_count is number of questions.
            # But let's look at details if available.
            
            current_score = 0
            current_max = 0
            
            if p.details:
                # Use details for precise analytics
                for q in p.details:
                    q_score = q.get('score', 0)
                    q_max = q.get('max_score', 10)
                    is_correct = q.get('is_correct', False)
                    q_type = q.get('question_type', 'Unknown')
                    
                    current_score += q_score
                    current_max += q_max
                    
                    # Topic Stats
                    if p.worksheet.topic_id:
                        topic_name = p.worksheet.topic_id # Ideally join to get name, or lazy load
                        # Using topic_id for now, will resolve name later
                        if topic_name not in topic_stats:
                            topic_stats[topic_name] = {"total": 0, "correct": 0}
                        topic_stats[topic_name]["total"] += 1
                        if is_correct:
                            topic_stats[topic_name]["correct"] += 1
                    
                    # Mistake Patterns
                    if not is_correct:
                        mistake_patterns[q_type] = mistake_patterns.get(q_type, 0) + 1
            else:
                # Fallback to summary columns if no details (legacy or simple)
                current_score = p.correct_count * 10 # Rough estimate
                current_max = p.total_count * 10
            
            student_stats[s_name]["total_score"] += current_score
            student_stats[s_name]["max_score"] += current_max
            student_stats[s_name]["worksheets"] += 1

        for row in analytics_rows:
            normalized_count = row.count if row.count and row.count > 0 else 1
            mistake_patterns[row.error_type] = mistake_patterns.get(row.error_type, 0) + normalized_count

        # 4. Format Output
        
        # Weak Topics
        weak_topics_list = []
        # Resolve Topic Names
        topic_ids = list(topic_stats.keys())
        topics = self.db.query(MathTopic).filter(MathTopic.id.in_(topic_ids)).all()
        topic_map = {t.id: t.topic_name for t in topics}
        
        for tid, stats in topic_stats.items():
            accuracy = (stats["correct"] / stats["total"]) * 100 if stats["total"] > 0 else 0
            if accuracy < 70: # Threshold for weak
                weak_topics_list.append({
                    "topic": topic_map.get(tid, f"Topic {tid}"),
                    "accuracy": round(accuracy, 1),
                    "total_questions": stats["total"]
                })
        
        weak_topics_list.sort(key=lambda x: x["accuracy"]) # Lowest accuracy first

        # Student Performance
        performance_list = []
        for name, stats in student_stats.items():
            avg = (stats["total_score"] / stats["max_score"] * 10) if stats["max_score"] > 0 else 0
            performance_list.append({
                "student": name,
                "average_score": round(avg, 1), # Scale 0-10
                "assignment_count": stats["worksheets"]
            })
        performance_list.sort(key=lambda x: x["average_score"]) # Lowest first

        # Common Mistakes
        mistakes_list = [
            {"type": k, "count": v} 
            for k, v in mistake_patterns.items()
        ]
        mistakes_list.sort(key=lambda x: x["count"], reverse=True) # Highest first

        return {
            "weak_topics": weak_topics_list,
            "student_performance": performance_list,
            "common_mistakes": mistakes_list[:5] # Top 5
        }

    def record_error_tags(
        self,
        *,
        class_id: int,
        teacher_id: int,
        source: str,
        error_tags: List[Dict[str, Any]],
        student_id: int | None = None,
        worksheet_id: int | None = None,
    ) -> int:
        """Persist error tags for later class-level analytics aggregation."""
        records_created = 0

        for tag in error_tags:
            try:
                normalized_count = int(tag.get("count", 1))
            except (TypeError, ValueError):
                normalized_count = 1

            row = StudentAnalytics(
                class_id=class_id,
                teacher_id=teacher_id,
                student_id=student_id,
                worksheet_id=worksheet_id,
                source=source,
                error_type=str(tag.get("error_type", "khac")),
                count=max(normalized_count, 1),
                ocr_confidence=tag.get("ocr_confidence"),
                payload={
                    "question_id": tag.get("question_id"),
                    "error_detail": tag.get("error_detail"),
                    "student_answer": tag.get("student_answer"),
                    "correct_answer": tag.get("correct_answer"),
                    "question_text": tag.get("question_text"),
                },
            )
            self.db.add(row)
            records_created += 1

        self.db.commit()
        return records_created

    def submit_reviewed_error_tags(
        self,
        *,
        class_id: int,
        teacher_id: int,
        source: str,
        error_tags: List[Dict[str, Any]],
        student_id: int | None = None,
        worksheet_id: int | None = None,
    ) -> int:
        """Validate ownership and persist only teacher-reviewed analytics tags."""
        if source != "teacher_review":
            raise ValueError("Chi chap nhan du lieu da duoc giao vien duyet")

        owned_class = (
            self.db.query(MathClass)
            .filter(
                MathClass.id == class_id,
                MathClass.teacher_id == teacher_id,
            )
            .first()
        )
        if not owned_class:
            raise PermissionError("Ban khong co quyen cap nhat thong ke lop nay")

        if student_id is not None:
            student = (
                self.db.query(Student)
                .filter(
                    Student.id == student_id,
                    Student.class_id == class_id,
                )
                .first()
            )
            if not student:
                raise LookupError("Hoc sinh khong thuoc lop da chon")

        if worksheet_id is not None:
            worksheet = (
                self.db.query(Worksheet)
                .filter(
                    Worksheet.id == worksheet_id,
                    Worksheet.class_id == class_id,
                )
                .first()
            )
            if not worksheet:
                raise LookupError("Bai tap khong thuoc lop da chon")

        return self.record_error_tags(
            class_id=class_id,
            teacher_id=teacher_id,
            student_id=student_id,
            worksheet_id=worksheet_id,
            source=source,
            error_tags=error_tags,
        )

    def get_student_errors(
        self,
        class_id: int,
        student_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Get per-student error records for a class, optionally filtered by student."""
        query = self.db.query(StudentAnalytics).filter(StudentAnalytics.class_id == class_id)
        if student_id is not None:
            query = query.filter(StudentAnalytics.student_id == student_id)

        rows = query.order_by(StudentAnalytics.created_at.desc()).all()

        result: List[Dict[str, Any]] = []
        for row in rows:
            payload = row.payload if isinstance(row.payload, dict) else {}
            result.append(
                {
                    "id": row.id,
                    "student_id": row.student_id,
                    "student_name": row.student.full_name if row.student else None,
                    "error_type": row.error_type,
                    "error_detail": payload.get("error_detail"),
                    "question_text": payload.get("question_text"),
                    "student_answer": payload.get("student_answer"),
                    "correct_answer": payload.get("correct_answer"),
                    "created_at": row.created_at.isoformat() if row.created_at else "",
                }
            )

        return result

    def update_error_record(self, record_id: int, teacher_id: int, updates: Dict[str, Any]) -> bool:
        """Update one analytics error record with teacher ownership check."""
        row = (
            self.db.query(StudentAnalytics)
            .filter(
                StudentAnalytics.id == record_id,
                StudentAnalytics.teacher_id == teacher_id,
            )
            .first()
        )
        if not row:
            return False

        if updates.get("error_type"):
            row.error_type = str(updates["error_type"])

        payload = dict(row.payload or {})
        if "error_detail" in updates:
            payload["error_detail"] = updates.get("error_detail")
        row.payload = payload

        self.db.commit()
        return True

    def delete_error_record(self, record_id: int, teacher_id: int) -> bool:
        """Delete one analytics error record with teacher ownership check."""
        row = (
            self.db.query(StudentAnalytics)
            .filter(
                StudentAnalytics.id == record_id,
                StudentAnalytics.teacher_id == teacher_id,
            )
            .first()
        )
        if not row:
            return False

        self.db.delete(row)
        self.db.commit()
        return True
