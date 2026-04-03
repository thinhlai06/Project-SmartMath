"""
Report Service - Generates PDF error analysis reports for grading results.
"""
import os
import json
import logging
import re
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.grading_report import GradingReport

logger = logging.getLogger(__name__)

# Directory to store generated reports
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "reports")


class ReportService:
    """Service for generating and managing grading reports."""
    
    def __init__(self, db: Session):
        self.db = db
        # Ensure reports directory exists
        os.makedirs(REPORTS_DIR, exist_ok=True)
    
    def generate_report(
        self,
        teacher_id: int,
        class_id: int,
        student_name: str,
        worksheet_title: str,
        total_score: float,
        max_score: float,
        results: List[Dict[str, Any]],
        raw_text: str = ""
    ) -> GradingReport:
        """
        Generate a text-based report file and save metadata to DB.
        Uses plain text format for maximum compatibility.
        """
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = self._sanitize_filename_part(student_name)
        filename = f"report_{safe_name}_{timestamp}.txt"
        filepath = os.path.abspath(os.path.join(REPORTS_DIR, filename))
        reports_dir_abs = os.path.abspath(REPORTS_DIR)
        if not filepath.startswith(reports_dir_abs):
            raise ValueError("Invalid report file path")
        
        # Generate report content
        content = self._build_report_content(
            student_name=student_name,
            worksheet_title=worksheet_title,
            total_score=total_score,
            max_score=max_score,
            results=results
        )
        
        # Write report file
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        # Save metadata to DB
        report = GradingReport(
            teacher_id=teacher_id,
            class_id=class_id,
            student_name=student_name,
            worksheet_title=worksheet_title,
            total_score=total_score,
            max_score=max_score,
            file_path=filepath,
            results_json=json.dumps(results, ensure_ascii=False)
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        
        logger.info("Report generated: %s", filename)
        return report

    def _sanitize_filename_part(self, value: str) -> str:
        normalized = re.sub(r"[^A-Za-z0-9_-]", "_", (value or "").strip())
        normalized = re.sub(r"_+", "_", normalized).strip("_")
        return (normalized or "hoc_sinh")[:24]
    
    def get_reports_for_class(self, class_id: int) -> List[GradingReport]:
        """Get all reports for a specific class."""
        return self.db.query(GradingReport).filter(
            GradingReport.class_id == class_id
        ).order_by(GradingReport.created_at.desc()).all()
    
    def get_report_by_id(self, report_id: int) -> GradingReport:
        """Get a specific report by ID."""
        return self.db.query(GradingReport).filter(
            GradingReport.id == report_id
        ).first()
    
    def _build_report_content(
        self,
        student_name: str,
        worksheet_title: str,
        total_score: float,
        max_score: float,
        results: List[Dict[str, Any]]
    ) -> str:
        """Build the text content for the report."""
        lines = []
        lines.append("=" * 60)
        lines.append("    BÁO CÁO PHÂN TÍCH LỖI SAI - SMART-MATHAI")
        lines.append("=" * 60)
        lines.append("")
        lines.append(f"  Học sinh: {student_name}")
        lines.append(f"  Bài kiểm tra: {worksheet_title}")
        lines.append(f"  Ngày tạo: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        lines.append(f"  Điểm tổng: {total_score}/{max_score}")
        
        # Calculate percentage
        percent = (total_score / max_score * 100) if max_score > 0 else 0
        lines.append(f"  Tỉ lệ đúng: {percent:.0f}%")
        lines.append("")
        lines.append("-" * 60)
        lines.append("  CHI TIẾT TỪNG CÂU HỎI")
        lines.append("-" * 60)
        lines.append("")
        
        correct_count = 0
        incorrect_count = 0
        
        for i, res in enumerate(results, 1):
            is_correct = res.get("is_correct", False)
            status_icon = "✓" if is_correct else "✗"
            
            if is_correct:
                correct_count += 1
            else:
                incorrect_count += 1
            
            lines.append(f"  Câu {res.get('question_id', i)}: [{status_icon}] {res.get('score', 0)}/{res.get('max_score', 1)} điểm")
            lines.append(f"    Học sinh trả lời: {res.get('student_answer', '(trống)')}")
            lines.append(f"    Đáp án đúng: {res.get('correct_answer', 'N/A')}")
            
            if res.get("reasoning"):
                lines.append(f"    Giải thích: {res['reasoning']}")
            if res.get("feedback"):
                lines.append(f"    Nhận xét: {res['feedback']}")
            lines.append("")
        
        # Summary
        lines.append("-" * 60)
        lines.append("  TỔNG KẾT")
        lines.append("-" * 60)
        lines.append(f"  Số câu đúng: {correct_count}/{len(results)}")
        lines.append(f"  Số câu sai: {incorrect_count}/{len(results)}")
        lines.append(f"  Điểm: {total_score}/{max_score} ({percent:.0f}%)")
        lines.append("")
        
        # Rating
        if percent >= 80:
            lines.append("  Đánh giá: GIỎI - Con đã nắm vững kiến thức! 🌟")
        elif percent >= 60:
            lines.append("  Đánh giá: KHÁ - Con cần luyện tập thêm một số dạng bài.")
        elif percent >= 40:
            lines.append("  Đánh giá: TRUNG BÌNH - Con cần ôn lại kiến thức cơ bản.")
        else:
            lines.append("  Đánh giá: CẦN CỐ GẮNG - Phụ huynh nên hỗ trợ con ôn lại bài.")
        
        lines.append("")
        
        # Recommendations for wrong answers
        wrong_items = [r for r in results if not r.get("is_correct", False)]
        if wrong_items:
            lines.append("-" * 60)
            lines.append("  GỢI Ý CẢI THIỆN")
            lines.append("-" * 60)
            for item in wrong_items:
                q_id = item.get("question_id", "?")
                lines.append(f"  • Câu {q_id}: Cần ôn lại dạng bài này.")
                if item.get("feedback"):
                    lines.append(f"    → {item['feedback']}")
            lines.append("")
        
        lines.append("=" * 60)
        lines.append("  Được tạo bởi Smart-MathAI")
        lines.append("=" * 60)
        
        return "\n".join(lines)
