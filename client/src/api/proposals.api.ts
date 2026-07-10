import api from "./axios";
import type {
  ApiMessageResponse,
  ApiSuccessResponse,
} from "../types/api";
import type {
  ListProposalsParams,
  Proposal,
  ProposalStatus,
} from "../types/proposal";

export const proposalsApi = {
  // Admin
  list: (params?: ListProposalsParams) =>
    api.get<ApiSuccessResponse<Proposal[]>>(
      "/api/v1/proposals",
      { params }
    ),

  getStats: () =>
    api.get<
      ApiSuccessResponse<{
        total: number;
        pending: number;
        accepted: number;
        rejected: number;
      }>
    >('/api/v1/proposals/stats'),

  // Freelancer
  getMy: (params?: ListProposalsParams) =>
    api.get<ApiSuccessResponse<Proposal[]>>(
      "/api/v1/proposals/my",
      { params }
    ),

  create: (data: {
    jobId: string;
    coverLetter: string;
    price: number;
    timeline: string;
  }) =>
    api.post<ApiSuccessResponse<Proposal>>(
      "/api/v1/proposals",
      data
    ),

  update: (
    id: string,
    data: Partial<{
      coverLetter: string;
      price: number;
      timeline: string;
    }>
  ) =>
    api.patch<ApiSuccessResponse<Proposal>>(
      `/api/v1/proposals/${id}`,
      data
    ),

  withdraw: (id: string) =>
    api.delete<ApiMessageResponse>(
      `/api/v1/proposals/${id}`
    ),

  // Shared
  getById: (id: string) =>
    api.get<ApiSuccessResponse<Proposal>>(
      `/api/v1/proposals/${id}`
    ),

  // Client
  getByJob: (
    jobId: string,
    params?: ListProposalsParams
  ) =>
    api.get<ApiSuccessResponse<Proposal[]>>(
      `/api/v1/proposals/job/${jobId}`,
      { params }
    ),

  updateStatus: (
    id: string,
    status: Extract<
      ProposalStatus,
      "accepted" | "rejected"
    >
  ) =>
    api.patch<ApiSuccessResponse<Proposal>>(
      `/api/v1/proposals/${id}/status`,
      { status }
    ),
};