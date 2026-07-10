import type { UserRole } from './auth';

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  phone?: string;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  portfolioLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  portfolioLink?: string;
  skills?: string[];
}

export interface PublicFreelancerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  role: 'freelancer';
  profileImage?: string;
  bio?: string;
  skills?: string[];
  portfolioLink?: string;
  emailVerified: boolean;
  createdAt?: string;
}

export interface FreelancerTrackStats {
  proposalsTotal: number;
  proposalsAccepted: number;
  proposalsPending: number;
  winRate: number;
  projectsActive: number;
  projectsCompleted: number;
}

export interface FreelancerRecentProject {
  id: string;
  title: string;
  category?: string;
  completedAt?: string;
}

export interface PublicFreelancerProfilePayload {
  profile: PublicFreelancerProfile;
  stats: FreelancerTrackStats;
  recentProjects: FreelancerRecentProject[];
}

export interface PublicFreelancerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  role: 'freelancer';
  profileImage?: string;
  bio?: string;
  skills?: string[];
  portfolioLink?: string;
  emailVerified: boolean;
  createdAt?: string;
}

export interface FreelancerTrackRecord {
  proposalsTotal: number;
  proposalsAccepted: number;
  proposalsPending: number;
  winRate: number;
  projectsActive: number;
  projectsCompleted: number;
}

export interface FreelancerRecentProject {
  id: string;
  title: string;
  category?: string;
  completedAt?: string;
}

export interface PublicFreelancerProfilePayload {
  profile: PublicFreelancerProfile;
  stats: FreelancerTrackRecord;
  recentProjects: FreelancerRecentProject[];
}

export interface PublicClientProfile {
  _id: string;
  firstName: string;
  lastName: string;
  role: 'client';
  profileImage?: string;
  bio?: string;
  emailVerified: boolean;
  createdAt?: string;
}

export interface ClientTrackStats {
  jobsPosted: number;
  projectsActive: number;
  projectsCompleted: number;
}

export interface PublicClientProfilePayload {
  profile: PublicClientProfile;
  stats: ClientTrackStats;
}
