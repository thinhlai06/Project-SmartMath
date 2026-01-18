import cv2
import numpy as np
import os

# Create white image
img = np.ones((600, 800, 3), dtype=np.uint8) * 255

# Add Text questions
# Question 1
cv2.putText(img, "Cau 1: Co bao nhieu qua tao?", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,0), 2)
# Answer 1 (Student writes "5 qua")
cv2.putText(img, "5 qua", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0,0,200), 2) # Redish color simulating pen

# Question 2
cv2.putText(img, "Cau 2: Tinh 5 + 5", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,0), 2)
# Answer 2 ("10")
cv2.putText(img, "10", (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0,0,200), 2)

# Save
path = os.path.join(os.getcwd(), "ocr_test_browser.png")
cv2.imwrite(path, img)
print(f"Created {path}")
