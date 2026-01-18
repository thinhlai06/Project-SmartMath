import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.ai.ocr_service import OCRService

try:
    print("Testing OCR Service directly...")
    service = OCRService()
    
    # Read test image
    with open("ocr_test_word_problem.png", "rb") as f:
        content = f.read()

    print(f"Image read: {len(content)} bytes")
    
    text = service.recognize(content)
    print("OCR Result:")
    print(text)
    
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
