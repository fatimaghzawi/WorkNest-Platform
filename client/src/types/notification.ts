export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedJobId?: string;
  relatedProposalId?: string;
  relatedProjectId?: string;
  relatedDeliverableId?: string;
  relatedPaymentId?: string;
  createdAt?: string;
}
