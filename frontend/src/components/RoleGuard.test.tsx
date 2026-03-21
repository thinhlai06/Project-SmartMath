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
};

function renderRoleGuard(allowedRole: 'teacher' | 'parent') {
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
        <Route path="/parent/dashboard" element={<div>Parent Dashboard</div>} />
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

  it('redirects authenticated user with wrong role', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuthContext,
      user: {
        id: 2,
        email: 'parent@example.com',
        full_name: 'Parent User',
        role: 'parent',
        created_at: new Date().toISOString(),
      },
      isAuthenticated: true,
    });

    renderRoleGuard('teacher');

    expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
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
