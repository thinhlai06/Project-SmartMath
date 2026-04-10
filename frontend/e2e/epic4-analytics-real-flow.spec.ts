import { expect, test } from '@playwright/test';

async function mockEpic4Apis(page: import('@playwright/test').Page) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === '/api/auth/me' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'teacher@demo.com',
          full_name: 'Giao vien Demo',
          role: 'teacher',
        }),
      });
    }

    if (path === '/api/dashboard/stats' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_classes: 1,
          total_students: 25,
          total_worksheets: 9,
          avg_score: 7.2,
        }),
      });
    }

    if (path === '/api/classes' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            class_name: 'Lop 2A',
            grade: 2,
            class_code: 'L2A001',
            student_count: 25,
          },
        ]),
      });
    }

    if (path === '/api/ai/analytics/1' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          weak_topics: [
            { topic: 'Phep nhan', accuracy: 62.5, total_questions: 16 },
          ],
          student_performance: [
            { student: 'Nguyen Van An', average_score: 4.8, assignment_count: 4 },
            { student: 'Tran Thi Binh', average_score: 8.3, assignment_count: 5 },
          ],
          common_mistakes: [
            { type: 'phep_nhan', count: 5 },
            { type: 'dien_ket_qua', count: 2 },
          ],
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

test.describe('Epic 4 - Real analytics flow', () => {
  test('home page renders analytics card from backend data', async ({ page }) => {
    await mockEpic4Apis(page);

    await page.goto('/');

    const totalErrorLabel = page.getByText('Tổng số lỗi tuần này');
    const totalErrorCard = totalErrorLabel.locator('..');

    await expect(totalErrorLabel).toBeVisible();
    await expect(totalErrorCard.getByText('7', { exact: true })).toBeVisible();
    await expect(page.getByText('Phep Nhan')).toBeVisible();
    await expect(page.getByText('Phát hiện 1 học sinh', { exact: false })).toBeVisible();
  });

  test('error analytics page visualizes backend common mistakes', async ({ page }) => {
    await mockEpic4Apis(page);

    await page.goto('/error-analytics');

    await expect(page.getByText('Phân tích lỗi sai')).toBeVisible();
    await expect(page.getByText('phep nhan', { exact: true })).toBeVisible();
    await expect(page.getByText('5 lần', { exact: true })).toBeVisible();
    await expect(page.getByText('Nguyen Van An')).toBeVisible();
  });
});
