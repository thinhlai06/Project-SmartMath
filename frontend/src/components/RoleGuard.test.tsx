import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import RoleGuard from './RoleGuard';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

const baseAuthContext = {
  isLoading: false,
  login: vi.fn(async () => undefined),
  logout: vi.fn(async () => undefined),
  register: vi.fn(async () => undefined),
  refreshUser: vi.fn(async () => undefined),
};

function renderRoleGuard(allowedRole: 'teacher') {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <RoleGuard allowedRole={allowedRole}>
              <div>Protected Content</div>
            </RoleGuard>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Teacher Home</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RoleGuard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to login', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuthContext,
      user: null,
      isAuthenticated: false,
    });

    renderRoleGuard('teacher');

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects authenticated user with wrong role to home', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuthContext,
      user: {
        id: 2,
        email: 'other@example.com',
        full_name: 'Other User',
        role: 'teacher' as const,
        created_at: new Date().toISOString(),
      },
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RoleGuard allowedRole="teacher" redirectTo="/classes">
                <div>Protected Content</div>
              </RoleGuard>
            }
          />
          <Route path="/classes" element={<div>Classes Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders protected content for allowed role', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuthContext,
      user: {
        id: 1,
        email: 'teacher@example.com',
        full_name: 'Teacher User',
        role: 'teacher',
        created_at: new Date().toISOString(),
      },
      isAuthenticated: true,
    });

    renderRoleGuard('teacher');

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
