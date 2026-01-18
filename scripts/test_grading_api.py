import requests
import cv2
import numpy as np
import json
import os

# Create sample image
def create_sample_image(text="Tra loi: 5 qua cam"):
    img = np.ones((200, 600, 3), dtype=np.uint8) * 255
    cv2.putText(img, text, (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 2)
    _, encoded = cv2.imencode('.png', img)
    return encoded.tobytes()

def main():
    url = "http://localhost:8000/api/ai/grade-image"
    
    # 1. Prepare Data
    img_bytes = create_sample_image()
    
    correct_answers = [
        {"id": 1, "answer": "5 quả cam", "points": 10}
    ]
    
    files = {"file": ("test.png", img_bytes, "image/png")}
    data = {"correct_answers_json": json.dumps(correct_answers)}
    
    print(f"Sending POST to {url}...")
    try:
        response = requests.post(url, files=files, data=data)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n--- Grading Result ---")
            print(f"Total Score: {result['total_score']}")
            print(f"Raw Text: {result['raw_text']}")
            print(f"Results: {json.dumps(result['results'], indent=2)}")
            
            # Check correctness
            # "Tra loi: 5 qua cam" vs "5 quả cam"
            # Logic in grading service: "5 qua cam" (normalized) == "5quacam" (normalized)
            # "Tra loi: 5 qua cam" -> OCR might return "Tra loi: 5 qua cam"
            # LLM Parsing -> "1": "5 qua cam" (hopefully)
            
            if result['total_score'] > 0:
                print("✅ Grading API Test Passed")
            else:
                print("⚠️ Grading API Test checks failed (Score 0). Check OCR/LLM logic.")
        else:
            print("❌ Grading API Failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
