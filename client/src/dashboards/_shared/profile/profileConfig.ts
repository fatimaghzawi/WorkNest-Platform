import type { UserRole } from '../../../types/auth';

export type ModernProfileRole = Extract<UserRole, 'freelancer' | 'client'>;

export interface ModernProfileConfig {
  role: ModernProfileRole;
  showSkills?: boolean;
  showPortfolio?: boolean;
}

export const PROFILE_COPY: Record<
  ModernProfileRole,
  {
    eyebrow: string;
    roleLabel: string;
    aboutSubtitle: string;
    aboutEmpty: string;
    contactSubtitle: string;
    bioPlaceholder: string;
  }
> = {
  freelancer: {
    eyebrow: 'Freelancer profile',
    roleLabel: 'Freelancer',
    aboutSubtitle: 'How clients discover your story and expertise',
    aboutEmpty:
      'Introduce yourself to clients — share your experience, strengths, and what makes you the right fit.',
    contactSubtitle: 'How clients reach you',
    bioPlaceholder: 'Tell clients about your experience, strengths, and what you deliver.',
  },
  client: {
    eyebrow: 'Client profile',
    roleLabel: 'Client',
    aboutSubtitle: 'How freelancers understand your business and hiring needs',
    aboutEmpty:
      'Tell freelancers about your company, the projects you post, and what you look for in collaborators.',
    contactSubtitle: 'How freelancers reach you',
    bioPlaceholder: 'Describe your business, team, and the types of projects you hire for.',
  },
};
