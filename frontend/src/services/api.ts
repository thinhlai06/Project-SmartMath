import axios from 'axios';
import type { Token, User, RegisterRequest } from '../types';

// Create axios instance
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth API
export const authApi = {
    login: async (email: string, password: string): Promise<Token> => {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const response = await api.post<Token>('/auth/login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<User> => {
        const response = await api.post<User>('/auth/register', data);
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },
};

export default api;
