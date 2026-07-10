import api from './axios';
import type { ApiMessageResponse, ApiSuccessResponse } from '../types/api';
import type {
  Category,
  CreateCategoryPayload,
  ListCategoriesParams,
  UpdateCategoryPayload,
} from '../types/category';

export const categoriesApi = {
  list: (params?: ListCategoriesParams) =>
    api.get<ApiSuccessResponse<Category[]>>('/api/v1/categories', { params }),

  getById: (id: string) => api.get<ApiSuccessResponse<Category>>(`/api/v1/categories/${id}`),

  create: (payload: CreateCategoryPayload) =>
    api.post<ApiSuccessResponse<Category>>('/api/v1/categories', payload),

  update: (id: string, payload: UpdateCategoryPayload) =>
    api.patch<ApiSuccessResponse<Category>>(`/api/v1/categories/${id}`, payload),

  delete: (id: string) => api.delete<ApiMessageResponse>(`/api/v1/categories/${id}`),
};
