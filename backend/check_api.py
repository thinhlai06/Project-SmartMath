import sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from app.database import SessionLocal
from app.models.worksheet import Worksheet
from app.schemas.worksheet import WorksheetDetailResponse

db = SessionLocal()
ws = db.query(Worksheet).filter(Worksheet.id == 17).first()
resp = WorksheetDetailResponse(
    id=ws.id, title=ws.title, class_id=ws.class_id,
    topic_id=ws.topic_id, grade=ws.grade, difficulty=ws.difficulty,
    status=ws.status, worksheet_type=ws.worksheet_type,
    objective=ws.objective, created_at=ws.created_at,
    published_at=ws.published_at, exercises=ws.exercises
)
data = json.loads(resp.model_dump_json())
for ex in data["exercises"]:
    q = ex["question"]
    print(f"  id={ex['id']} tier={ex['difficulty_tier']} question=[{q[:60]}]")
db.close()
