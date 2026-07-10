export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface ProposalFreelancer {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profileImage?: string;
  skills?: string[];
  bio?: string;
  portfolioLink?: string;
}

export interface ProposalJob {
  _id: string;
  title: string;
  status: string;
  budget: number;
  category: string;
  deadline: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export interface Proposal {
  _id: string;
  jobId: ProposalJob | string;
  freelancerId: ProposalFreelancer | string;
  coverLetter: string;
  price: number;
  timeline: string;
  status: ProposalStatus;
  createdAt: string;
}

export interface ListProposalsParams {
  status?: ProposalStatus;
  page?: number;
  limit?: number;
}
