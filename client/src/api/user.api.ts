import api from './axios';
import type { ApiMessageResponse, ApiSuccessResponse } from '../types/api';
import type {
  AdminUser,
  CreateUserPayload,
  ListUsersParams,
  UpdateUserPayload,
  UserStats,
} from '../types/user';

export const usersApi = {
  list: (params?: ListUsersParams) =>
    api.get<ApiSuccessResponse<AdminUser[]>>('/api/v1/users', { params }),

  getStats: () => api.get<ApiSuccessResponse<UserStats>>('/api/v1/users/stats'),

  getById: (id: string) => api.get<ApiSuccessResponse<AdminUser>>(`/api/v1/users/${id}`),

  create: (payload: CreateUserPayload) =>
    api.post<ApiSuccessResponse<AdminUser>>('/api/v1/users', payload),

  update: (id: string, payload: UpdateUserPayload) =>
    api.patch<ApiSuccessResponse<AdminUser>>(`/api/v1/users/${id}`, payload),

  delete: (id: string) => api.delete<ApiMessageResponse>(`/api/v1/users/${id}`),
};
