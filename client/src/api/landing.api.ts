import api from './axios';
import type { ApiSuccessResponse } from '../types/api';
import type { LandingFeaturedJob, LandingTopFreelancer } from '../types/landing';

export const landingApi = {
  getFeaturedJobs: () =>
    api.get<ApiSuccessResponse<LandingFeaturedJob[]>>('/api/v1/landing/featured-jobs'),

  getTopFreelancers: () =>
    api.get<ApiSuccessResponse<LandingTopFreelancer[]>>('/api/v1/landing/top-freelancers'),

  listFreelancers: (params?: { page?: number; limit?: number }) =>
    api.get<ApiSuccessResponse<LandingTopFreelancer[]>>('/api/v1/landing/freelancers', {
      params,
    }),
};