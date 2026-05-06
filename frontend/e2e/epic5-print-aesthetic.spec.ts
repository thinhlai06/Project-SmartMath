import { expect, test } from '@playwright/test';

async function mockEpic5Apis(page: import('@playwright/test').Page) {
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

    if (path === '/api/worksheets/1' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          title: 'Luyen tap phep cong',
          class_id: 1,
          topic_id: 101,
          grade: 2,
          difficulty: null,
          status: 'draft',
          worksheet_type: 'differentiation',
          objective: 'Cuong co ky nang tinh nham',
          created_at: '2026-04-09T00:00:00Z',
          published_at: null,
          exercise_count: 2,
          exercises: [
            {
              id: 11,
              worksheet_id: 1,
              question: '5 + 7 = ?',
              answer: '12',
              hint: 'Dem them 7 vao 5',
              difficulty_tier: null,
              order_index: 1,
            },
            {
              id: 12,
              worksheet_id: 1,
              question: '8 + 6 = ?',
              answer: '14',
              hint: null,
              difficulty_tier: null,
              order_index: 2,
            },
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

test.describe('Epic 5 - Print aesthetic refinement', () => {
  test('export button triggers window.print', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__printCalled = false;
      window.print = () => {
        (window as any).__printCalled = true;
      };
    });

    await mockEpic5Apis(page);
    await page.goto('/worksheets/1/edit');

    await expect(page.getByRole('button', { name: 'In worksheet' })).toBeVisible();
    await page.getByRole('button', { name: 'In worksheet' }).click();

    const printCalled = await page.evaluate(() => (window as any).__printCalled);
    expect(printCalled).toBeTruthy();
  });

  test('question blocks keep print-safe classes and print mode hides navigation', async ({ page }) => {
    await mockEpic5Apis(page);
    await page.goto('/worksheets/1/edit');

    const questionItems = page.locator('.question-item');
    await expect(questionItems).toHaveCount(2);

    await page.emulateMedia({ media: 'print' });

    await expect(page.locator('nav.sticky.top-0')).toBeHidden();

    const firstQuestion = questionItems.first();
    await expect(firstQuestion).toHaveCSS('break-inside', 'avoid');
  });
});
