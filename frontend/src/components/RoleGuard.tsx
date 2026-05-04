import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RoleGuardProps {
    children: ReactNode;
    allowedRole: 'teacher';
    redirectTo?: string;
}

/**
 * RoleGuard - Protects routes based on user role.
 * Redirects to appropriate page if user doesn't have required role.
 */
export default function RoleGuard({ children, allowedRole, redirectTo }: RoleGuardProps) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== allowedRole) {
        // Redirect to role-appropriate page
        return <Navigate to={redirectTo || '/'} replace />;
    }

    return <>{children}</>;
}
