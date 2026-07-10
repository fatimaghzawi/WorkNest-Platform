import api from './axios';
import type { ApiSuccessResponse } from '../types/api';
import type { Notification } from '../types/notification';

export const notificationsApi = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get<ApiSuccessResponse<Notification[]>>('/api/v1/notifications', { params }),

  unreadCount: () =>
    api.get<ApiSuccessResponse<{ count: number }>>('/api/v1/notifications/unread-count'),

  markRead: (id: string) =>
    api.patch<ApiSuccessResponse<Notification>>(`/api/v1/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<ApiSuccessResponse<{ count: number }>>('/api/v1/notifications/read-all'),
};
