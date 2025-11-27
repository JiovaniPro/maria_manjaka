import apiClient from './apiClient';
import type { ApiResponse, User } from '../types';

type LoginCredentials = {
    email: string;
    motDePasse: string;
};

type LoginResponse = {
    token: string;
    user: User;
};

export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
            '/auth/login',
            credentials
        );
        return data.data;
    },

    async getMe(): Promise<User> {
        const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
        return data.data;
    },

    async logout(): Promise<void> {
        await apiClient.post('/auth/logout');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
};
