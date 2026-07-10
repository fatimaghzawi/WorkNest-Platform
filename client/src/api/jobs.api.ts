import api from './axios';
import type { ApiMessageResponse, ApiSuccessResponse } from '../types/api';
import type {
  CreateJobPayload,
  Job,
  JobStatus,
  ListJobsParams,
  UpdateJobPayload,
} from '../types/job';

export const jobsApi = {
  list: (params?: ListJobsParams) =>
    api.get<ApiSuccessResponse<Job[]>>('/api/v1/jobs', { params }),

  getStats: () =>
    api.get<
      ApiSuccessResponse<{
        total: number;
        open: number;
        inProgress: number;
        closed: number;
      }>
    >('/api/v1/jobs/stats'),

  getMyJobs: (params?: ListJobsParams) =>
    api.get<ApiSuccessResponse<Job[]>>('/api/v1/jobs/my', { params }),

  getById: (id: string) => api.get<ApiSuccessResponse<Job>>(`/api/v1/jobs/${id}`),

  create: (payload: CreateJobPayload) =>
    api.post<ApiSuccessResponse<Job>>('/api/v1/jobs', payload),

  update: (id: string, payload: UpdateJobPayload) =>
    api.patch<ApiSuccessResponse<Job>>(`/api/v1/jobs/${id}`, payload),

  updateStatus: (id: string, status: JobStatus) =>
    api.patch<ApiSuccessResponse<Job>>(`/api/v1/jobs/${id}/status`, { status }),

  delete: (id: string) => api.delete<ApiMessageResponse>(`/api/v1/jobs/${id}`),
};
