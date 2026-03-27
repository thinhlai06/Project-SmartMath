import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('./api', () => ({
  default: mockApi,
}));

import { classApi } from './classApi';

describe('classApi service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getClasses returns data from backend', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          class_name: '3A',
          grade: 3,
          class_code: 'ABC123',
          student_count: 20,
        },
      ],
    });

    const classes = await classApi.getClasses();

    expect(mockApi.get).toHaveBeenCalledWith('/classes', { params: { skip: 0, limit: 20 } });
    expect(classes).toHaveLength(1);
    expect(classes[0].class_name).toBe('3A');
  });

  it('createClass sends payload and returns created class', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: {
        id: 10,
        class_name: '2B',
        grade: 2,
        class_code: 'XYZ999',
        student_count: 0,
      },
    });

    const created = await classApi.createClass({ class_name: '2B', grade: 2 });

    expect(mockApi.post).toHaveBeenCalledWith('/classes', { class_name: '2B', grade: 2 });
    expect(created.id).toBe(10);
    expect(created.class_code).toBe('XYZ999');
  });
});
