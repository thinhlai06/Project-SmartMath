import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockApiInstance } = vi.hoisted(() => ({
  mockApiInstance: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockApiInstance),
  },
  create: vi.fn(() => mockApiInstance),
}));

import { authApi } from './api';

describe('authApi service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login posts form-urlencoded credentials and returns token payload', async () => {
    mockApiInstance.post.mockResolvedValueOnce({
      data: { access_token: 'token-123', token_type: 'bearer' },
    });

    const result = await authApi.login('teacher@example.com', 'secret123');

    expect(mockApiInstance.post).toHaveBeenCalledTimes(1);
    const [url, params, config] = mockApiInstance.post.mock.calls[0] as [string, URLSearchParams, { headers: Record<string, string> }];
    expect(url).toBe('/auth/login');
    expect(params.get('username')).toBe('teacher@example.com');
    expect(params.get('password')).toBe('secret123');
    expect(config.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(result.access_token).toBe('token-123');
  });

  it('register and getMe proxy response data', async () => {
    mockApiInstance.post.mockResolvedValueOnce({
      data: {
        id: 1,
        email: 'teacher@example.com',
        full_name: 'Teacher One',
        role: 'teacher',
        created_at: '2026-01-01T00:00:00Z',
      },
    });
    mockApiInstance.get.mockResolvedValueOnce({
      data: {
        id: 1,
        email: 'teacher@example.com',
        full_name: 'Teacher One',
        role: 'teacher',
        created_at: '2026-01-01T00:00:00Z',
      },
    });

    const user = await authApi.register({
      email: 'teacher@example.com',
      password: 'secret123',
      full_name: 'Teacher One',
      role: 'teacher',
    });
    const me = await authApi.getMe();

    expect(user.email).toBe('teacher@example.com');
    expect(me.role).toBe('teacher');
    expect(mockApiInstance.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
    expect(mockApiInstance.get).toHaveBeenCalledWith('/auth/me');
  });
});
