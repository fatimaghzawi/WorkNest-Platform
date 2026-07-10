import api from './axios';
import type { ApiSuccessResponse } from '../types/api';
import type {
  CreateInterviewPayload,
  Interview,
  ListInterviewsParams,
  UpdateInterviewPayload,
} from '../types/interview';

export const interviewsApi = {
  list: (params?: ListInterviewsParams) =>
    api.get<ApiSuccessResponse<Interview[]>>('/api/v1/interviews', { params }),

  getById: (id: string) =>
    api.get<ApiSuccessResponse<Interview>>(`/api/v1/interviews/${id}`),

  create: (payload: CreateInterviewPayload) =>
    api.post<ApiSuccessResponse<Interview>>('/api/v1/interviews', payload),

  update: (id: string, payload: UpdateInterviewPayload) =>
    api.patch<ApiSuccessResponse<Interview>>(`/api/v1/interviews/${id}`, payload),

  cancel: (id: string) =>
    api.patch<ApiSuccessResponse<Interview>>(`/api/v1/interviews/${id}/cancel`),

  confirm: (id: string) =>
    api.patch<ApiSuccessResponse<Interview>>(`/api/v1/interviews/${id}/confirm`),

  complete: (id: string) =>
    api.patch<ApiSuccessResponse<Interview>>(`/api/v1/interviews/${id}/complete`),

  decline: (id: string) =>
    api.patch<ApiSuccessResponse<Interview>>(`/api/v1/interviews/${id}/decline`),
};
