import { expect, test } from '@playwright/test';

async function mockDashboardApis(
  page: import('@playwright/test').Page,
  stats: { total_classes: number; total_students: number; total_worksheets: number; avg_score: number | null }
) {
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
        body: JSON.stringify(stats),
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
            class_code: 'ABC123',
            student_count: 30,
          },
        ]),
      });
    }

    // Keep other dashboard requests deterministic for e2e.
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

test.describe('Epic 2 - Dashboard real stats flow', () => {
  test('shows avg score with one decimal and conditional color', async ({ page }) => {
    await mockDashboardApis(page, {
      total_classes: 2,
      total_students: 40,
      total_worksheets: 8,
      avg_score: 8.54,
    });

    await page.goto('/');

    const avgCard = page.locator('div.glass-panel').filter({ has: page.getByText('Điểm TB') }).first();

    await expect(avgCard.getByText('8.5')).toBeVisible();
    await expect(avgCard.locator('p').nth(1)).toHaveClass(/text-emerald-500/);
    await expect(page.getByText('Coming soon')).toHaveCount(0);
  });

  test('shows dash when avg score is null', async ({ page }) => {
    await mockDashboardApis(page, {
      total_classes: 1,
      total_students: 20,
      total_worksheets: 3,
      avg_score: null,
    });

    await page.goto('/');

    const avgCard = page.locator('div.glass-panel').filter({ has: page.getByText('Điểm TB') }).first();

    await expect(avgCard.getByText('-', { exact: true })).toBeVisible();
    await expect(avgCard.locator('p').nth(1)).toHaveClass(/text-slate-500/);
  });
});
