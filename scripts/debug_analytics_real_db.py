import sys
import os
import json

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.database import SessionLocal, Base, engine
from app.services.ai.analytics_service import AnalyticsService
from app.models.student_progress import StudentProgress

def debug_analytics():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Debugging Analytics for Class 1...")
        service = AnalyticsService(db)
        result = service.analyze_class_errors(1)
        print("Success!")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_analytics()
