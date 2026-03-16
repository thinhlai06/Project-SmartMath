from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.models.student_progress import StudentProgress
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
        
        if not progress_list:
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
