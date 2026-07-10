import api from './axios';
import type { ApiSuccessResponse } from '../types/api';
import { LandingTopFreelancer } from '../types/landing';


export const landingApi = {
  getTopFreelancers: () =>
    api.get<ApiSuccessResponse<LandingTopFreelancer[]>>('/api/v1/landing/top-freelancers'),

  listFreelancers: (params?: { page?: number; limit?: number }) =>
    api.get<ApiSuccessResponse<LandingTopFreelancer[]>>('/api/v1/landing/freelancers', {
      params,
    }),
};