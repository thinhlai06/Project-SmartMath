import sys
import os
import json
from datetime import datetime

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.student import Student
from app.models.student_progress import StudentProgress, ProgressStatus
from app.models.math_class import MathClass
from app.models.worksheet import Worksheet, WorksheetType, WorksheetStatus
from app.models.math_topic import MathTopic
from app.services.ai.analytics_service import AnalyticsService

# Setup Temp DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_analytics.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def test_analytics():
    if os.path.exists("./test_analytics.db"):
        os.remove("./test_analytics.db")
        
    init_db()
    db = TestingSessionLocal()
    
    try:
        # 1. Create Data
        # Class
        math_class = MathClass(class_name="Lop 1A", grade=1, teacher_id=1, class_code="TEST1")
        db.add(math_class)
        db.commit()
        
        # Topic
        topic = MathTopic(topic_name="Phep Cong Pham Vi 10", grade=1, category="So hoc")
        db.add(topic)
        db.commit()
        
        # Student
        student = Student(full_name="Nguyen Van A", class_id=math_class.id)
        db.add(student)
        db.commit()
        
        # Worksheet
        worksheet = Worksheet(
            title="Bai Tap Cong", 
            class_id=math_class.id, 
            topic_id=topic.id, 
            grade=1, 
            worksheet_type=WorksheetType.CPA,
            status=WorksheetStatus.PUBLISHED
        )
        db.add(worksheet)
        db.commit()
        
        # Progress with Details (Scenario: Weak on Word Problems)
        details = [
            {
                "question_id": "1", 
                "question_type": "trac_nghiem", 
                "is_correct": True, 
                "score": 10, "max_score": 10
            },
            {
                "question_id": "2", 
                "question_type": "loi_van", 
                "is_correct": False, 
                "score": 0, "max_score": 10
            },
            {
                "question_id": "3", 
                "question_type": "loi_van", 
                "is_correct": False, 
                "score": 0, "max_score": 10
            }
        ]
        
        progress = StudentProgress(
            student_id=student.id,
            worksheet_id=worksheet.id,
            status=ProgressStatus.COMPLETED,
            correct_count=1,
            total_count=3,
            details=details
        )
        db.add(progress)
        db.commit()
        
        # 2. Run Analytics
        service = AnalyticsService(db)
        result = service.analyze_class_errors(math_class.id)
        
        print("\n--- Analytics Result ---")
        print(json.dumps(result, indent=2))
        
        # 3. Assertions
        assert len(result["weak_topics"]) == 1
        assert result["weak_topics"][0]["topic"] == "Phep Cong Pham Vi 10"
        assert result["weak_topics"][0]["accuracy"] == 33.3
        
        assert result["common_mistakes"][0]["type"] == "loi_van"
        assert result["common_mistakes"][0]["count"] == 2
        
        print("\n✅ Analytics Logic Verified!")
        
    except Exception as e:
        print(f"\n❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
        engine.dispose()
        # Cleanup
        # Cleanup
        if os.path.exists("./test_analytics.db"):
            os.remove("./test_analytics.db")

if __name__ == "__main__":
    test_analytics()
