import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

const AUTH_SESSION_FLAG = 'smartmath:auth-session';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, fullName: string, role: 'teacher') => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Avoid unnecessary auth check on public visits when there is no known session.
        const hasKnownSession = window.localStorage.getItem(AUTH_SESSION_FLAG) === '1';
        const currentPath = window.location.pathname;
        const isPublicRoute = currentPath === '/' || currentPath === '/login' || currentPath === '/register';

        if (!hasKnownSession && isPublicRoute) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        authApi.getMe()
            .then((profile) => {
                setUser(profile);
                window.localStorage.setItem(AUTH_SESSION_FLAG, '1');
            })
            .catch(() => {
                setUser(null);
                window.localStorage.removeItem(AUTH_SESSION_FLAG);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const login = async (email: string, password: string) => {
        await authApi.login(email, password);
        const userData = await authApi.getMe();
        setUser(userData);
        window.localStorage.setItem(AUTH_SESSION_FLAG, '1');
    };

    const refreshUser = async () => {
        try {
            const userData = await authApi.getMe();
            setUser(userData);
            window.localStorage.setItem(AUTH_SESSION_FLAG, '1');
        } catch (error) {
            setUser(null);
            window.localStorage.removeItem(AUTH_SESSION_FLAG);
            throw error;
        }
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        window.localStorage.removeItem(AUTH_SESSION_FLAG);
    };

    const register = async (
        email: string,
        password: string,
        fullName: string,
        role: 'teacher'
    ) => {
        await authApi.register({
            email,
            password,
            full_name: fullName,
            role,
        });
        // Auto login after registration
        await login(email, password);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                register,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
