import api from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type {
  FreelancerMatchSuggestion,
  JobMatchSuggestion,
  MatchingMeta,
} from '@/types/matching';

export const matchingApi = {
  /** Suggested open jobs for the logged-in freelancer (read-only). */
  suggestJobs: (params?: { page?: number; limit?: number }) =>
    api.get<ApiSuccessResponse<JobMatchSuggestion[]> & { meta?: MatchingMeta }>(
      '/api/v1/matching/jobs',
      { params }
    ),

  /** Suggested freelancers for a client's job (read-only — does not hire). */
  suggestFreelancers: (jobId: string, params?: { page?: number; limit?: number }) =>
    api.get<
      ApiSuccessResponse<{
        suggestions: FreelancerMatchSuggestion[];
        job: { _id: string; title: string; skills: string[]; category: string };
      }> & { meta?: MatchingMeta }
    >(`/api/v1/matching/jobs/${jobId}/freelancers`, { params }),
};
