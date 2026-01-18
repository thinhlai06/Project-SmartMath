"""PDF Generation Service for Worksheet Export."""
from fpdf import FPDF
from io import BytesIO
from typing import Optional, List
from dataclasses import dataclass
from enum import Enum

from app.models.worksheet import Worksheet, WorksheetType
from app.models.worksheet_exercise import WorksheetExercise


class PaperSize(str, Enum):
    """Paper size options."""
    A4 = "A4"
    A5 = "A5"
    LETTER = "Letter"


class Orientation(str, Enum):
    """Page orientation options."""
    PORTRAIT = "P"
    LANDSCAPE = "L"


class FontSize(str, Enum):
    """Font size options."""
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"


class Spacing(str, Enum):
    """Spacing options."""
    COMPACT = "compact"
    NORMAL = "normal"
    SPACIOUS = "spacious"


@dataclass
class PdfExportSettings:
    """PDF export settings."""
    paper_size: PaperSize = PaperSize.A4
    orientation: Orientation = Orientation.PORTRAIT
    with_answers: bool = False
    font_size: FontSize = FontSize.MEDIUM
    spacing: Spacing = Spacing.NORMAL


# Font size mappings
FONT_SIZE_MAP = {
    FontSize.SMALL: {"title": 14, "section": 12, "body": 9, "hint": 8},
    FontSize.MEDIUM: {"title": 16, "section": 13, "body": 11, "hint": 9},
    FontSize.LARGE: {"title": 18, "section": 15, "body": 13, "hint": 11},
}

# Spacing mappings (line height multiplier)
SPACING_MAP = {
    Spacing.COMPACT: {"section": 6, "exercise": 4, "line": 5},
    Spacing.NORMAL: {"section": 10, "exercise": 6, "line": 7},
    Spacing.SPACIOUS: {"section": 14, "exercise": 10, "line": 10},
}

# CPA Section names
CPA_SECTIONS = {
    "concrete": {"name": "CỤ THỂ (CONCRETE)", "desc": "Sử dụng vật thật"},
    "pictorial": {"name": "HÌNH ẢNH (PICTORIAL)", "desc": "Sử dụng hình vẽ"},
    "abstract": {"name": "TRỪU TƯỢNG (ABSTRACT)", "desc": "Sử dụng ký hiệu"},
}

# Differentiation tier names
DIFF_TIERS = {
    "foundation": {"name": "NỀN TẢNG", "icon": "A"},
    "standard": {"name": "CHUẨN", "icon": "B"},
    "extension": {"name": "MỞ RỘNG", "icon": "C"},
    "advanced": {"name": "NÂNG CAO", "icon": "D"},
}


class WorksheetPDF(FPDF):
    """Custom PDF class for worksheet generation."""
    
    def __init__(self, settings: PdfExportSettings, worksheet_title: str = ""):
        super().__init__(orientation=settings.orientation.value, format=settings.paper_size.value)
        self.settings = settings
        self.worksheet_title = worksheet_title
        self.fonts = FONT_SIZE_MAP[settings.font_size]
        self.spacing = SPACING_MAP[settings.spacing]
        
        # Add Unicode font for Vietnamese
        self.add_font("DejaVu", "", "DejaVuSans.ttf", uni=True)
        self.add_font("DejaVu", "B", "DejaVuSans-Bold.ttf", uni=True)
        
    def header(self):
        """Add header to each page."""
        self.set_font("DejaVu", "B", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "Smart-MathAI", align="L")
        self.ln(10)
        
    def footer(self):
        """Add footer with page number."""
        self.set_y(-15)
        self.set_font("DejaVu", "", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Trang {self.page_no()}", align="C")
        
    def add_worksheet_title(self, title: str, class_name: str, grade: int):
        """Add worksheet title section."""
        self.set_font("DejaVu", "B", self.fonts["title"])
        self.set_text_color(0, 0, 0)
        self.cell(0, 10, title.upper(), align="C", new_x="LMARGIN", new_y="NEXT")
        
        self.set_font("DejaVu", "", self.fonts["body"])
        self.set_text_color(80, 80, 80)
        self.cell(0, 6, f"Lớp: {class_name} | Khối: {grade}", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(self.spacing["section"])
        
    def add_section_header(self, section_name: str, description: str = ""):
        """Add a section header."""
        self.set_fill_color(240, 240, 250)
        self.set_font("DejaVu", "B", self.fonts["section"])
        self.set_text_color(50, 50, 100)
        self.cell(0, 8, f"  {section_name}", fill=True, new_x="LMARGIN", new_y="NEXT")
        
        if description:
            self.set_font("DejaVu", "", self.fonts["hint"])
            self.set_text_color(100, 100, 100)
            self.cell(0, 5, f"  {description}", new_x="LMARGIN", new_y="NEXT")
            
        self.ln(self.spacing["exercise"])
        
    def add_exercise(self, number: int, question: str, answer: str = None, hint: str = None):
        """Add an exercise question."""
        self.set_font("DejaVu", "B", self.fonts["body"])
        self.set_text_color(0, 0, 0)
        
        # Question number and text
        self.cell(10, self.spacing["line"], f"{number}.", new_x="RIGHT")
        self.set_font("DejaVu", "", self.fonts["body"])
        
        # Handle multi-line question
        self.multi_cell(0, self.spacing["line"], question, new_x="LMARGIN", new_y="NEXT")
        
        # Answer (if enabled)
        if self.settings.with_answers and answer:
            self.set_font("DejaVu", "", self.fonts["hint"])
            self.set_text_color(0, 128, 0)
            self.cell(10, self.spacing["line"], "", new_x="RIGHT")
            self.cell(0, self.spacing["line"], f"Đáp án: {answer}", new_x="LMARGIN", new_y="NEXT")
            
        # Hint (optional)
        if hint:
            self.set_font("DejaVu", "", self.fonts["hint"])
            self.set_text_color(100, 100, 150)
            self.cell(10, self.spacing["line"], "", new_x="RIGHT")
            self.cell(0, self.spacing["line"], f"Gợi ý: {hint}", new_x="LMARGIN", new_y="NEXT")
            
        self.ln(self.spacing["exercise"])


def generate_worksheet_pdf(
    worksheet: Worksheet,
    exercises: List[WorksheetExercise],
    class_name: str,
    settings: PdfExportSettings = None
) -> BytesIO:
    """
    Generate a PDF for a worksheet.
    
    Args:
        worksheet: The worksheet model
        exercises: List of exercises
        class_name: Name of the class
        settings: PDF export settings
        
    Returns:
        BytesIO buffer containing the PDF
    """
    if settings is None:
        settings = PdfExportSettings()
        
    # Create PDF
    pdf = WorksheetPDF(settings, worksheet.title)
    pdf.add_page()
    
    # Add title
    pdf.add_worksheet_title(worksheet.title, class_name, worksheet.grade)
    
    # Add objective if present
    if worksheet.objective:
        pdf.set_font("DejaVu", "", pdf.fonts["body"])
        pdf.set_text_color(80, 80, 80)
        pdf.multi_cell(0, pdf.spacing["line"], f"Mục tiêu: {worksheet.objective}")
        pdf.ln(pdf.spacing["section"])
    
    # Generate content based on worksheet type
    if worksheet.worksheet_type == WorksheetType.CPA:
        _add_cpa_content(pdf, exercises)
    else:
        _add_differentiation_content(pdf, exercises)
        
    # Output to buffer
    buffer = BytesIO()
    pdf.output(buffer)
    buffer.seek(0)
    
    return buffer


def _add_cpa_content(pdf: WorksheetPDF, exercises: List[WorksheetExercise]):
    """Add CPA-structured content to PDF."""
    exercise_num = 1
    
    for section_type, section_info in CPA_SECTIONS.items():
        section_exercises = [e for e in exercises if e.exercise_type and e.exercise_type.value == section_type]
        
        if section_exercises:
            pdf.add_section_header(
                f"PHẦN: {section_info['name']}",
                section_info['desc']
            )
            
            for ex in sorted(section_exercises, key=lambda x: x.order_index):
                pdf.add_exercise(
                    exercise_num,
                    ex.question,
                    ex.answer,
                    ex.hint
                )
                exercise_num += 1


def _add_differentiation_content(pdf: WorksheetPDF, exercises: List[WorksheetExercise]):
    """Add differentiation-tiered content to PDF."""
    exercise_num = 1
    
    for tier_key, tier_info in DIFF_TIERS.items():
        tier_exercises = [e for e in exercises if e.difficulty_tier and e.difficulty_tier.value == tier_key]
        
        if tier_exercises:
            pdf.add_section_header(
                f"PHẦN {tier_info['icon']}: {tier_info['name']}"
            )
            
            for ex in sorted(tier_exercises, key=lambda x: x.order_index):
                pdf.add_exercise(
                    exercise_num,
                    ex.question,
                    ex.answer,
                    ex.hint
                )
                exercise_num += 1
