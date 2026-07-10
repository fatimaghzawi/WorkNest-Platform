import api from './axios';
import type { ApiSuccessResponse } from '../types/api';
import type { ListLogsParams, LogStats, SystemLog } from '../types/log';

export const logsApi = {
  list: (params?: ListLogsParams) =>
    api.get<ApiSuccessResponse<SystemLog[]>>('/api/v1/logs', { params }),

  getStats: () => api.get<ApiSuccessResponse<LogStats>>('/api/v1/logs/stats'),
};
