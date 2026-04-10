import { expect, test } from '@playwright/test';

async function mockDifferentiationApis(page: import('@playwright/test').Page) {
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

    if (path === '/api/classes' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            class_name: 'Lop 1A',
            grade: 1,
            class_code: 'A1CODE',
            student_count: 4,
          },
        ]),
      });
    }

    if (path === '/api/topics' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 101,
            topic_name: 'Phép cộng trong phạm vi 10',
            category: 'Số học',
            grade: 1,
          },
        ]),
      });
    }

    if (path === '/api/classes/1/students' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 11,
            full_name: 'Nguyen Van An',
            tier: null,
            avg_score: 4.8,
            class_id: 1,
            created_at: '2026-01-01T00:00:00Z',
          },
          {
            id: 12,
            full_name: 'Tran Thi Binh',
            tier: null,
            avg_score: 6.4,
            class_id: 1,
            created_at: '2026-01-01T00:00:00Z',
          },
          {
            id: 13,
            full_name: 'Le Van Cuong',
            tier: 'extension',
            avg_score: 8.4,
            class_id: 1,
            created_at: '2026-01-01T00:00:00Z',
          },
          {
            id: 14,
            full_name: 'Pham Thi Dung',
            tier: null,
            avg_score: 9.2,
            class_id: 1,
            created_at: '2026-01-01T00:00:00Z',
          },
        ]),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

test.describe('Epic 3 - Differentiation real students flow', () => {
  test('loads students from API and auto bins tiers by backend tier or avg score', async ({ page }) => {
    await mockDifferentiationApis(page);

    await page.goto('/differentiation-wizard');

    await expect(page.getByText('Thiết kế Bài tập Phân hóa')).toBeVisible();

    await page.locator('button[role="combobox"]').filter({ hasText: 'Chọn chủ đề bài học...' }).click();
    await page.getByRole('option', { name: 'Phép cộng trong phạm vi 10 (Số học)' }).click();
    await page.getByRole('button', { name: 'Tiếp tục' }).click();

    await expect(page.getByTestId('tier-column-foundation')).toContainText('Nguyen Van An');
    await expect(page.getByTestId('tier-column-standard')).toContainText('Tran Thi Binh');
    await expect(page.getByTestId('tier-column-extension')).toContainText('Le Van Cuong');
    await expect(page.getByTestId('tier-column-advanced')).toContainText('Pham Thi Dung');

    await expect(page.getByTestId('tier-count-foundation')).toContainText('1');
    await expect(page.getByTestId('tier-count-standard')).toContainText('1');
    await expect(page.getByTestId('tier-count-extension')).toContainText('1');
    await expect(page.getByTestId('tier-count-advanced')).toContainText('1');

    await expect(page.getByText('Trần Thị Bình')).toHaveCount(0);
  });
});
