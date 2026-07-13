export interface LandingTopFreelancer {
  freelancerId: string;
  completedProjects: number;
  firstName: string;
  lastName: string;
  skills: string[];
  profileImage?: string;
  bio?: string;
}

export interface LandingFeaturedJob {
  id: string;
  title: string;
  category: string;
  budget: number;
  skills: string[];
  createdAt: string;
}