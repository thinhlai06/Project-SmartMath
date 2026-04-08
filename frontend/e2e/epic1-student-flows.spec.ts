import { expect, test } from '@playwright/test';

type MockState = {
  uploaded: boolean;
};

async function installEpic1ApiMocks(page: import('@playwright/test').Page, state: MockState) {
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
            class_code: 'ABC123',
            student_count: state.uploaded ? 2 : 1,
          },
        ]),
      });
    }

    if (path === '/api/classes/1' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          class_name: 'Lop 1A',
          grade: 1,
          class_code: 'ABC123',
          student_count: state.uploaded ? 2 : 1,
        }),
      });
    }

    if (path === '/api/classes/1/students' && method === 'GET') {
      const students = state.uploaded
        ? [
            {
              id: 11,
              class_id: 1,
              full_name: 'Nguyen Van A',
              tier: 'standard',
              dob: '2018-01-15',
              parent_name: 'Tran Thi B',
              parent_phone: '0909123456',
              avg_score: 8.5,
              created_at: '2026-01-01T00:00:00',
            },
            {
              id: 12,
              class_id: 1,
              full_name: 'Le Thi C',
              tier: 'foundation',
              dob: null,
              parent_name: 'Pham Van D',
              parent_phone: '0911222333',
              avg_score: 5.8,
              created_at: '2026-01-01T00:00:00',
            },
          ]
        : [
            {
              id: 11,
              class_id: 1,
              full_name: 'Nguyen Van A',
              tier: 'standard',
              dob: '2018-01-15',
              parent_name: 'Tran Thi B',
              parent_phone: '0909123456',
              avg_score: 8.5,
              created_at: '2026-01-01T00:00:00',
            },
          ];

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(students),
      });
    }

    if (path === '/api/classes/1/students/upload' && method === 'POST') {
      state.uploaded = true;
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 11,
            class_id: 1,
            full_name: 'Nguyen Van A',
            tier: 'standard',
            dob: '2018-01-15',
            parent_name: 'Tran Thi B',
            parent_phone: '0909123456',
            avg_score: null,
            created_at: '2026-01-01T00:00:00',
          },
          {
            id: 12,
            class_id: 1,
            full_name: 'Le Thi C',
            tier: 'foundation',
            dob: null,
            parent_name: 'Pham Van D',
            parent_phone: '0911222333',
            avg_score: null,
            created_at: '2026-01-01T00:00:00',
          },
        ]),
      });
    }

    if (path === '/api/classes/1/worksheets' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }

    if (path === '/api/classes/1/announcements' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }

    // Default no-op response to keep UI flow deterministic in e2e.
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

test.describe('Epic 1 - Class detail student flows', () => {
  test('opens student profile dialog with required fields', async ({ page }) => {
    const state: MockState = { uploaded: false };
    await installEpic1ApiMocks(page, state);

    await page.goto('/classes/1');

    await expect(page.getByText('Lop 1A')).toBeVisible();
    await page.getByText('Nguyen Van A').click();

    await expect(page.getByText(/Hồ sơ học sinh/i)).toBeVisible();
    await expect(page.getByText(/Ngày sinh/i)).toBeVisible();
    await expect(page.getByText('Phụ huynh', { exact: true })).toBeVisible();
    await expect(page.getByText('SĐT phụ huynh', { exact: true })).toBeVisible();
    await expect(page.getByText(/Điểm trung bình/i)).toBeVisible();
    await expect(page.getByText('8.5')).toBeVisible();
  });

  test('imports students from excel and refreshes list', async ({ page }) => {
    const state: MockState = { uploaded: false };
    await installEpic1ApiMocks(page, state);

    await page.goto('/classes/1');

    await expect(page.getByRole('button', { name: 'Import Excel' })).toBeVisible();

    await page.setInputFiles('input[type="file"]', 'e2e/fixtures/students-template.xlsx');

    await expect(page.getByText(/Đang import file Excel, vui lòng chờ/i)).toBeVisible();
    await expect(page.getByText(/Đã import 2 học sinh/i)).toBeVisible();
    await expect(page.getByText('Le Thi C')).toBeVisible();
  });
});
