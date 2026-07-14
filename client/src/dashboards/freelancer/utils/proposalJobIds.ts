import { proposalsApi } from '../../../api/proposals.api';
import type { Proposal } from '../../../types/proposal';

export async function fetchAllMyProposalJobIds() {
  const ids = new Set<string>();
  let page = 1;
  let totalPages = 1;

  do {
    const response = await proposalsApi.getMy({ page, limit: 50 });
    response.data.data.forEach((proposal: Proposal) => {
      ids.add(typeof proposal.jobId === 'string' ? proposal.jobId : proposal.jobId._id);
    });
    totalPages = response.data.meta?.totalPages || 1;
    page += 1;
  } while (page <= totalPages);

  return ids;
}
