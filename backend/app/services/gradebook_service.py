from sqlalchemy.orm import Session
from app.models.student import Student
from app.models.worksheet import Worksheet
from app.models.grade_entry import GradeEntry
from app.schemas.gradebook import GradebookResponse, StudentGradeRecord
import io
import openpyxl
from datetime import datetime
from fastapi.responses import StreamingResponse

class GradebookService:
    def __init__(self, db: Session):
        self.db = db

    def get_class_gradebook(self, class_id: int) -> GradebookResponse:
        # Get published worksheets for the class
        worksheets = self.db.query(Worksheet).filter(
            Worksheet.class_id == class_id,
            Worksheet.status == "published"
        ).order_by(Worksheet.created_at).all()

        ws_data = [{"id": ws.id, "title": ws.title} for ws in worksheets]
        ws_ids = [ws.id for ws in worksheets]

        # Get students
        students = self.db.query(Student).filter(Student.class_id == class_id).all()
        student_ids = [s.id for s in students]

        # Get grades
        grades = []
        if student_ids and ws_ids:
            grades = self.db.query(GradeEntry).filter(
                GradeEntry.student_id.in_(student_ids),
                GradeEntry.worksheet_id.in_(ws_ids)
            ).all()

        grade_map = {}
        for g in grades:
            if g.student_id not in grade_map:
                grade_map[g.student_id] = {}
            grade_map[g.student_id][g.worksheet_id] = g.score

        records = []
        for s in students:
            records.append(StudentGradeRecord(
                student_id=s.id,
                full_name=s.full_name,
                grades=grade_map.get(s.id, {})
            ))

        return GradebookResponse(
            class_id=class_id,
            worksheets=ws_data,
            student_records=records
        )

    def upsert_grade(self, student_id: int, worksheet_id: int, score: float) -> GradeEntry:
        grade = self.db.query(GradeEntry).filter(
            GradeEntry.student_id == student_id,
            GradeEntry.worksheet_id == worksheet_id
        ).first()

        if grade:
            grade.score = score
            grade.updated_at = datetime.utcnow()
        else:
            grade = GradeEntry(
                student_id=student_id,
                worksheet_id=worksheet_id,
                score=score
            )
            self.db.add(grade)
        
        self.db.commit()
        self.db.refresh(grade)
        return grade

    def export_excel(self, class_id: int) -> StreamingResponse:
        data = self.get_class_gradebook(class_id)
        
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Bảng Điểm"
        
        # Headers theo yêu cầu: Họ và tên,Ngày sinh,Họ tên bố/mẹ,SĐT bố/mẹ,[Tên bài 1],...,[Điểm trung bình]
        headers = ["Họ và tên", "Ngày sinh", "Họ tên bố/mẹ", "SĐT bố/mẹ"]
        for worksheet in data.worksheets:
            headers.append(worksheet["title"])
        headers.append("Điểm trung bình")
        ws.append(headers)
        
        students = self.db.query(Student).filter(Student.class_id == class_id).all()
        student_map = {s.id: s for s in students}
        
        for record in data.student_records:
            student = student_map.get(record.student_id)
            if not student:
                continue
                
            row = [
                student.full_name,
                student.dob.strftime("%d/%m/%Y") if student.dob else "",
                student.parent_name or "",
                student.parent_phone or ""
            ]
            
            total_score = 0
            count = 0
            for worksheet in data.worksheets:
                ws_id = worksheet["id"]
                score = record.grades.get(ws_id)
                if score is not None:
                    row.append(score)
                    total_score += score
                    count += 1
                else:
                    row.append("")
                    
            avg_score = round(total_score / count, 2) if count > 0 else ""
            row.append(avg_score)
            ws.append(row)
            
        stream = io.BytesIO()
        wb.save(stream)
        stream.seek(0)
        
        return StreamingResponse(
            iter([stream.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=bang_diem_lop_{class_id}.xlsx"}
        )
