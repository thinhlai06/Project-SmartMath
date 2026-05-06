import { expect, test } from '@playwright/test';

const teacherUser = {
  id: 1,
  email: 'teacher@demo.com',
  full_name: 'Giao vien Demo',
  role: 'teacher',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(teacherUser),
    });
  });

  await page.route('**/api/classes**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          class_name: 'Lop 1A',
          grade: 1,
          class_code: 'ABC123',
          student_count: 30,
        },
      ]),
    });
  });
});

test('Differentiation wizard page loads for teacher', async ({ page }) => {
  await page.route('**/api/topics**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 101,
          topic_name: 'Phep cong trong pham vi 20',
          grade: 1,
        },
      ]),
    });
  });

  await page.route('**/api/ai/generate-differentiation', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        foundation: [{ question: '2 + 3 = ?', answer: '5', hint: 'Dem them' }],
        standard: [{ question: '5 + 4 = ?', answer: '9', hint: 'Tinh nhanh' }],
        extension: [],
        advanced: [],
        rag_sources: ['Lop1-SGK.pdf'],
      }),
    });
  });

  await page.goto('/differentiation-wizard');
  await expect(page.getByText('Thiết kế Bài tập Phân hóa')).toBeVisible();
});

test('AI grading page can upload and show grading results', async ({ page }) => {
  await page.route('**/api/ai/grade-image', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_score: 10,
        max_score: 10,
        raw_text: '2 + 3 = 5',
        extracted_json: { '1': '5' },
        ocr_tokens: [{ text: '5', confidence: 0.98 }],
        ocr_avg_confidence: 98,
        results: [
          {
            question_id: '1',
            student_answer: '5',
            correct_answer: '5',
            is_correct: true,
            score: 10,
            max_score: 10,
            ocr_confidence: 98,
            low_confidence_tokens: [],
          },
        ],
      }),
    });
  });

  await page.goto('/ai-grading');

  await expect(page.getByText('Chấm điểm AI (Beta)')).toBeVisible();
  await expect(page.getByText('Powered by GLM-OCR')).toBeVisible();

  await page.setInputFiles('input[type="file"]', 'e2e/fixtures/answer.png');

  await page.getByRole('button', { name: 'Chấm điểm ngay' }).click();

  await expect(page.getByText('Kết quả chi tiết')).toBeVisible();
  await expect(page.getByText('10 / 10')).toBeVisible();
});
