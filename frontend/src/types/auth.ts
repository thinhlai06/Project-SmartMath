// Auth types (kept from original)

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: 'teacher';
    created_at: string;
}

export type UserRole = User['role'];

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
}

export interface UpdateMeRequest {
    full_name?: string;
    current_password?: string;
    new_password?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

// Alias for backward compatibility (api.ts imports Token)
export type Token = AuthResponse;

export interface ApiError {
    detail: string;
}
