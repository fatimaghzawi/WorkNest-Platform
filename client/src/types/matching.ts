export type MatchBreakdown = {
  skillScore: number;
  categoryScore: number;
  overlapCount: number;
  jobSkillCount: number;
  matchedSkills: string[];
  missingSkills: string[];
};

export type JobMatchSuggestion = {
  job: import('@/types/job').Job;
  score: number;
  breakdown: MatchBreakdown;
  reason: string;
};

export type FreelancerMatchSuggestion = {
  freelancer: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    skills: string[];
    bio?: string;
    portfolioLink?: string;
  };
  score: number;
  breakdown: MatchBreakdown;
  reason: string;
};

export type MatchingMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hint?: string;
};
