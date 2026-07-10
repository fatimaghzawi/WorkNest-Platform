import api from './axios';
import type { ApiMessageResponse, ApiSuccessResponse, PaginationMeta } from '../types/api';
import type { WorkspaceTask, WorkspaceTeam, WorkspaceAttachment } from '../dashboards/_shared/workspace/types';

export type WorkspaceTasksMeta = PaginationMeta & {
  readOnly?: boolean;
};

export type ListWorkspaceParams = {
  page?: number;
  limit?: number;
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  status?: WorkspaceTask['status'];
  priority?: WorkspaceTask['priority'];
  dueDate?: string | null;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

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

  uploadAttachment: (jobId: string, file: File, caption?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption?.trim()) formData.append('caption', caption.trim());
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
