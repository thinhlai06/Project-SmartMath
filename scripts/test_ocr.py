import sys
import os
import cv2
import numpy as np

# Add backend to path (c:\project smartstudy\backend)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_dir = os.path.join(project_root, 'backend')
sys.path.append(backend_dir)

from app.services.ai.ocr_service import OCRService

def create_sample_image(text="Test OCR 123"):
    # Create white image
    img = np.ones((200, 600, 3), dtype=np.uint8) * 255
    
    # Use cv2 for simple text
    cv2.putText(img, text, (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (0,0,0), 3)
        
    _, encoded = cv2.imencode('.png', img)
    return encoded.tobytes()

def main():
    print("Testing OCR Service...")
    try:
        service = OCRService()
        
        # Test 1: Simple image
        print("Generating sample image...")
        img_bytes = create_sample_image("SmartMath AI")
        
        print("Running OCR...")
        text = service.recognize(img_bytes)
        
        print("\n--- OCR Result ---")
        print(text)
        print("------------------\n")
        
        if "SmartMath" in text or "AI" in text:
            print("✅ OCR Test Passed!")
        else:
            print("❌ OCR Test Failed (Expected 'SmartMath AI')")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
