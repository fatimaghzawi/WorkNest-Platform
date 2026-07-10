import type { Proposal, ProposalFreelancer } from '../types/proposal';

/** Populated ref — `typeof null === 'object'`, so check value is non-null. */
export function getProposalFreelancer(proposal: Proposal): ProposalFreelancer | null {
  const { freelancerId } = proposal;
  if (freelancerId && typeof freelancerId === 'object') return freelancerId;
  return null;
}

export function getProposalJobTitle(proposal: Proposal): string {
  const { jobId } = proposal;
  if (jobId && typeof jobId === 'object') return jobId.title || 'Job';
  return 'Job';
}

export function getProposalFreelancerName(proposal: Proposal): string {
  const freelancer = getProposalFreelancer(proposal);
  if (!freelancer) return 'Freelancer';
  const first = freelancer.firstName?.trim() || '';
  const last = freelancer.lastName?.trim() || '';
  const name = `${first} ${last}`.trim();
  return name || 'Freelancer';
}
