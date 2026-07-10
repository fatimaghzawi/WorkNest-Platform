import api from './axios';
import type { ApiSuccessResponse } from '../types/api';

export type ProjectStatus = 'active' | 'pending_review' | 'completed' | 'cancelled';

export interface Project {
  _id: string;
  id: string;
  jobId: string;
  jobTitle: string;
  jobStatus?: 'open' | 'closed' | 'in_progress';
  jobBudget?: number;
  jobDeadline?: string;
  title: string;
  status: ProjectStatus;
  progress: number;
  clientId: string;
  freelancerId: string;
  clientName: string;
  freelancerName: string;
  githubLink?: string;
  deliveryNotes?: string;
  reviewNotes?: string;
  submittedAt?: string;
  createdAt?: string;
  contractAmount?: number;
  escrowStatus?: 'pending' | 'held' | 'released' | 'refunded';
  payment?: {
    id: string;
    amount: number;
    status: 'pending' | 'held' | 'released' | 'refunded';
    cardBrand?: string;
    cardLast4?: string;
    cardholderName?: string;
  };
}

export const projectsApi = {
  list: (params?: { status?: ProjectStatus; page?: number; limit?: number }) =>
    api.get<ApiSuccessResponse<Project[]>>('/api/v1/projects', { params }),

  getStats: () =>
    api.get<
      ApiSuccessResponse<{
        total: number;
        active: number;
        completed: number;
        cancelled: number;
      }>
    >('/api/v1/projects/stats'),

  getById: (id: string) =>
    api.get<ApiSuccessResponse<Project>>(`/api/v1/projects/${id}`),

  submitForReview: (id: string, payload?: { deliveryNotes?: string }) =>
    api.patch<ApiSuccessResponse<Project>>(`/api/v1/projects/${id}/submit`, payload ?? {}),

  accept: (id: string) =>
    api.patch<ApiSuccessResponse<Project>>(`/api/v1/projects/${id}/accept`),

  requestReview: (id: string, payload: { reviewNotes: string }) =>
    api.patch<ApiSuccessResponse<Project>>(`/api/v1/projects/${id}/request-review`, payload),

  cancel: (id: string, payload?: { reason?: string }) =>
    api.patch<ApiSuccessResponse<Project>>(`/api/v1/projects/${id}/cancel`, payload ?? {}),
};
