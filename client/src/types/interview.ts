export type InterviewStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'declined';

export interface InterviewParticipant {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface InterviewJob {
  _id: string;
  title: string;
}

export interface Interview {
  id: string;
  _id?: string;
  jobId: string;
  jobTitle: string;
  proposalId: string;
  clientId: string;
  freelancerId: string;
  clientName: string;
  freelancerName: string;
  scheduledDate: string;
  duration: number;
  meetingLink: string;
  meetingPassword?: string;
  notes?: string;
  status: InterviewStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInterviewPayload {
  jobId: string;
  proposalId: string;
  freelancerId?: string;
  scheduledDate: string;
  duration: number;
  meetingLink: string;
  meetingPassword?: string;
  notes?: string;
}

export interface UpdateInterviewPayload {
  scheduledDate?: string;
  duration?: number;
  meetingLink?: string;
  meetingPassword?: string;
  notes?: string;
  status?: InterviewStatus;
}

export interface ListInterviewsParams {
  month?: number;
  year?: number;
  status?: InterviewStatus;
  page?: number;
  limit?: number;
}
