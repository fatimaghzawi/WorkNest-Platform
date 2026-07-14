import api from './axios';
import type { ApiMessageResponse, ApiSuccessResponse, PaginationMeta } from '../types/api';
import type { WorkspaceTask, WorkspaceTeam, WorkspacePermissions, WorkspaceAttachment, TaskDeliverableGroup } from '../dashboards/_shared/workspace/types';

export type WorkspaceTasksMeta = PaginationMeta & {
  readOnly?: boolean;
  permissions?: WorkspacePermissions;
  progress?: number;
};

export type ListWorkspaceParams = {
  page?: number;
  limit?: number;
  taskId?: string;
  previewLimit?: number;
  origin?: 'client' | 'freelancer';
  priority?: 'low' | 'medium' | 'high';
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
};

export type TaskDeliverablesMeta = PaginationMeta & {
  totalAttachments?: number;
  previewLimit?: number;
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  status?: WorkspaceTask['status'];
  priority?: WorkspaceTask['priority'];
  dueDate?: string | null;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload> & {
  submissionNotes?: string;
};

export const workspaceApi = {
  getTeam: (jobId: string) =>
    api.get<ApiSuccessResponse<WorkspaceTeam>>(`/api/v1/workspaces/${jobId}/team`),

  listTasks: (jobId: string, params?: ListWorkspaceParams) =>
    api.get<ApiSuccessResponse<WorkspaceTask[]> & { meta?: WorkspaceTasksMeta }>(
      `/api/v1/workspaces/${jobId}/tasks`,
      { params }
    ),

  createTask: (jobId: string, payload: CreateTaskPayload) =>
    api.post<ApiSuccessResponse<WorkspaceTask>>(`/api/v1/workspaces/${jobId}/tasks`, payload),

  updateTask: (jobId: string, taskId: string, payload: UpdateTaskPayload) =>
    api.patch<ApiSuccessResponse<WorkspaceTask>>(
      `/api/v1/workspaces/${jobId}/tasks/${taskId}`,
      payload
    ),

  deleteTask: (jobId: string, taskId: string) =>
    api.delete<ApiMessageResponse>(`/api/v1/workspaces/${jobId}/tasks/${taskId}`),

  listAttachments: (jobId: string, params?: ListWorkspaceParams) =>
    api.get<ApiSuccessResponse<WorkspaceAttachment[]>>(`/api/v1/workspaces/${jobId}/attachments`, {
      params,
    }),

  listTaskDeliverables: (jobId: string, params?: ListWorkspaceParams) =>
    api.get<ApiSuccessResponse<TaskDeliverableGroup[]> & { meta?: TaskDeliverablesMeta }>(
      `/api/v1/workspaces/${jobId}/deliverables`,
      { params }
    ),

  uploadAttachment: (jobId: string, file: File, options?: { caption?: string; taskId?: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.caption?.trim()) formData.append('caption', options.caption.trim());
    if (options?.taskId) formData.append('taskId', options.taskId);
    return api.post<ApiSuccessResponse<WorkspaceAttachment>>(
      `/api/v1/workspaces/${jobId}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  deleteAttachment: (jobId: string, attachmentId: string) =>
    api.delete<ApiMessageResponse>(
      `/api/v1/workspaces/${jobId}/attachments/${attachmentId}`
    ),
};

export default workspaceApi;
