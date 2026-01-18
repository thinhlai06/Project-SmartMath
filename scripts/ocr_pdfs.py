"""
Script để OCR tất cả PDF trong data_raw sử dụng OCRmyPDF.
Tạo bản PDF mới với text layer tại data_ocr/

Yêu cầu:
- Tesseract OCR đã cài với Vietnamese language pack
- Ghostscript đã cài
- pip install ocrmypdf
"""

import os
import subprocess
import shutil

# Cấu hình PATH cho Tesseract và Ghostscript
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR"
GHOSTSCRIPT_PATH = r"C:\Program Files\gs\gs10.06.0\bin"

# Thêm vào PATH
os.environ["PATH"] = f"{TESSERACT_PATH};{GHOSTSCRIPT_PATH};" + os.environ.get("PATH", "")

# Thư mục
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
DATA_ROOT = os.path.join(PROJECT_ROOT, "data_raw")
OUTPUT_ROOT = os.path.join(PROJECT_ROOT, "data_ocr")

def ocr_pdf(input_path: str, output_path: str) -> bool:
    """
    Chạy OCRmyPDF trên một file PDF.
    
    Args:
        input_path: Đường dẫn file PDF gốc
        output_path: Đường dẫn file PDF output (có text layer)
    
    Returns:
        True nếu thành công, False nếu lỗi
    """
    try:
        # Tạo thư mục output nếu chưa có
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Chạy OCRmyPDF với tiếng Việt
        result = subprocess.run([
            "ocrmypdf",
            "--language", "vie",           # Tiếng Việt
            "--force-ocr",                 # Bắt buộc OCR tất cả pages
            "--optimize", "1",             # Tối ưu nhẹ
            "--output-type", "pdf",
            input_path,
            output_path
        ], capture_output=True, text=True, timeout=600)  # 10 phút timeout
        
        if result.returncode == 0:
            return True
        else:
            print(f"   ⚠️ OCR warning: {result.stderr[:200] if result.stderr else 'Unknown error'}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"   ⏰ Timeout khi xử lý file")
        return False
    except Exception as e:
        print(f"   ❌ Lỗi: {e}")
        return False


def main():
    print("🔍 OCRmyPDF - Thêm text layer vào PDFs")
    print("=" * 50)
    
    if not os.path.exists(DATA_ROOT):
        print(f"❌ Không tìm thấy thư mục: {DATA_ROOT}")
        return
    
    # Tạo thư mục output
    if os.path.exists(OUTPUT_ROOT):
        print(f"🗑️  Xóa thư mục output cũ: {OUTPUT_ROOT}")
        shutil.rmtree(OUTPUT_ROOT)
    os.makedirs(OUTPUT_ROOT)
    
    # Đếm và xử lý PDFs
    pdf_files = []
    for root, dirs, files in os.walk(DATA_ROOT):
        for filename in files:
            if filename.endswith(".pdf"):
                input_path = os.path.join(root, filename)
                # Giữ nguyên cấu trúc thư mục
                relative_path = os.path.relpath(input_path, DATA_ROOT)
                output_path = os.path.join(OUTPUT_ROOT, relative_path)
                pdf_files.append((input_path, output_path, filename))
    
    print(f"📁 Tìm thấy {len(pdf_files)} file PDF")
    print()
    
    success_count = 0
    for i, (input_path, output_path, filename) in enumerate(pdf_files, 1):
        print(f"[{i}/{len(pdf_files)}] 📖 {filename}")
        
        if ocr_pdf(input_path, output_path):
            print(f"   ✅ Thành công")
            success_count += 1
        else:
            print(f"   ❌ Thất bại")
    
    print()
    print("=" * 50)
    print(f"🎉 HOÀN TẤT: {success_count}/{len(pdf_files)} files được OCR")
    print(f"📂 Output: {OUTPUT_ROOT}")
    print()
    print("💡 Tiếp theo: Chạy ingest.py với data_ocr để nạp vào vector DB")


if __name__ == "__main__":
    main()
