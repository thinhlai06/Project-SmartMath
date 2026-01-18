import cv2
import numpy as np
import os

# Create white image for Word Problem Test
# 800x800
img = np.ones((800, 800, 3), dtype=np.uint8) * 255

# Title
cv2.putText(img, "BAI KIEM TRA TOAN", (250, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 2)

# Question 1: Simple Math
cv2.putText(img, "Cau 1: 15 + 25 = ?", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,0), 2)
# Student Answer 1: Correct
cv2.putText(img, "40", (50, 140), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0,0,200), 2)

# Question 2: Word Problem (Bai toan co loi van)
cv2.putText(img, "Cau 2: Lan co 10 qua cam, Me cho them 5 qua.", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,0), 2)
cv2.putText(img, "Hoi Lan co tat ca bao nhieu qua?", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,0), 2)

# Student Answer 2: Word Problem format
cv2.putText(img, "Bai giai", (100, 290), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,200), 2)
cv2.putText(img, "So qua cam Lan co la:", (100, 330), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,200), 2)
cv2.putText(img, "10 + 5 = 15 (qua)", (100, 370), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,200), 2)
cv2.putText(img, "Dap so: 15 qua", (100, 410), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,200), 2)

# Save
path = os.path.join(os.getcwd(), "ocr_test_word_problem.png")
cv2.imwrite(path, img)
print(f"Created {path}")
