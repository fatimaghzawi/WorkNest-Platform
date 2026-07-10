export type JobStatus = 'open' | 'closed' | 'in_progress';

export interface JobClient {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profileImage?: string;
}

export interface Job {
  _id: string;
  clientId: JobClient | string;
  title: string;
  description: string;
  category: string;
  budget: number;
  skills: string[];
  deadline: string;
  status: JobStatus;
  createdAt: string;
  deletedAt?: string | null;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  category: string;
  budget: number;
  skills: string[];
  deadline: string;
}

export interface UpdateJobPayload {
  title?: string;
  description?: string;
  category?: string;
  budget?: number;
  skills?: string[];
  deadline?: string;
}

export interface ListJobsParams {
  category?: string;
  status?: JobStatus;
  search?: string;
  clientId?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'budget_asc' | 'budget_desc';
  budgetMin?: number;
  budgetMax?: number;
}
