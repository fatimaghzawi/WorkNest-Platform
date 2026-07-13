import api from './axios';
import type { GoogleLoginPayload, LoginPayload, RegisterPayload, User } from '../types/auth';

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<{ success: boolean; message: string }>('/api/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<{ success: boolean; user: User; accessToken: string }>('/api/auth/login', payload),

  googleLogin: (payload: GoogleLoginPayload) =>
    api.post<{ success: boolean; user: User; accessToken: string }>('/api/auth/google', payload),

  refresh: () =>
    api.post<{ success: boolean; user: User; accessToken: string }>('/api/auth/refresh'),

  logout: () => api.post<{ success: boolean; message: string }>('/api/auth/logout'),

  getMe: () => api.get<{ success: boolean; user: User }>('/api/auth/me'),

  forgotPassword: (email: string) =>
    api.post<{ success: boolean; message: string }>('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ success: boolean; message: string }>(`/api/auth/reset-password/${token}`, {
      password,
    }),
};
