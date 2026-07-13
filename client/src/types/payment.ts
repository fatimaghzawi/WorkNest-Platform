export type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded';

export interface Payment {
  id: string;
  _id: string;
  projectId: string;
  jobId: string;
  proposalId: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  cardBrand?: string;
  cardLast4?: string;
  cardholderName?: string;
  projectTitle?: string;
  paymentDate?: string;
  depositedAt?: string;
  releasedAt?: string;
  createdAt?: string;
  platformFee?: number;
  freelancerPayout?: number;
  feeRate?: number;
  budgetRangeLabel?: string;
}

export interface WalletSummary {
  role: 'client' | 'freelancer' | 'admin';
  pendingDeposit?: number;
  inEscrow?: number;
  completedPayouts?: number;
  availableBalance?: number;
  pendingPayouts?: number;
  totalEarned?: number;
  totalProfit?: number;
  profitThisMonth?: number;
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface ListPaymentsParams {
  status?: PaymentStatus;
  page?: number;
  limit?: number;
}
