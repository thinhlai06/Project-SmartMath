// User types
export type UserRole = 'teacher' | 'parent';

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: UserRole;
    created_at: string;
}

// Auth types
export interface LoginRequest {
    username: string; // email
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
}

export interface Token {
    access_token: string;
    token_type: string;
}

// API Response types
export interface ApiError {
    detail: string;
}
