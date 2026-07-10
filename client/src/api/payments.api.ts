import api from './axios';
import type { ApiSuccessResponse } from '../types/api';
import type { CheckoutSessionResponse, ListPaymentsParams, Payment, WalletSummary } from '../types/payment';

export const paymentsApi = {
  wallet: () => api.get<ApiSuccessResponse<WalletSummary>>('/api/v1/payments/wallet'),

  list: (params?: ListPaymentsParams) =>
    api.get<ApiSuccessResponse<Payment[]>>('/api/v1/payments', { params }),

  getByProject: (projectId: string) =>
    api.get<ApiSuccessResponse<Payment | null>>(`/api/v1/payments/project/${projectId}`),

  createCheckoutSession: (projectId: string, returnPath?: string) =>
    api.post<ApiSuccessResponse<CheckoutSessionResponse>>(
      `/api/v1/payments/project/${projectId}/checkout-session`,
      returnPath ? { returnPath } : {}
    ),

  confirmCheckout: (projectId: string, sessionId?: string) =>
    api.post<ApiSuccessResponse<Payment>>(
      `/api/v1/payments/project/${projectId}/confirm-checkout`,
      sessionId ? { sessionId } : {}
    ),
};
