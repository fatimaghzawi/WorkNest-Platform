import Button from '../../../../components/common/Button';
import StatusBadge from '../../../../components/jobs/StatusBadge';
import type { Proposal } from '../../../../types/proposal';
import { formatCurrency, formatDateTime } from '../../../../utils/format';
import { getProposalFreelancerName, getProposalJobTitle } from '../../../../utils/proposal';
import '../../../../css/ProposalsAdmin.css';

export default function ProposalListItem({
  proposal,
  busy,
  onAccept,
  onReject,
  onSchedule,
}: {
  proposal: Proposal;
  busy?: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onSchedule: (proposal: Proposal) => void;
}) {
  const coverPreview =
    proposal.coverLetter.length > 160
      ? `${proposal.coverLetter.slice(0, 160).trim()}…`
      : proposal.coverLetter;

  return (
    <article className={`wn-proposal-row wn-proposal-row--${proposal.status}`}>
      <span className="wn-proposal-row__rail" aria-hidden />

      <div className="wn-proposal-row__main">
        <div className="wn-proposal-row__head">
          <div className="wn-proposal-row__titles">
            <h3 className="wn-proposal-row__title">{getProposalJobTitle(proposal)}</h3>
            <p className="wn-proposal-row__meta">
              {getProposalFreelancerName(proposal)}
              <span className="wn-proposal-row__meta-sep">·</span>
              {formatCurrency(proposal.price ?? 0)}
              <span className="wn-proposal-row__meta-sep">·</span>
              {proposal.timeline}
            </p>
          </div>
          <StatusBadge status={proposal.status} kind="proposal" />
        </div>

        <p className="wn-proposal-row__cover">{coverPreview}</p>

        <p className="wn-proposal-row__submitted">
          Submitted {formatDateTime(proposal.createdAt)}
        </p>

        {proposal.status === 'pending' && (
          <div className="wn-proposal-row__actions">
            <Button size="sm" disabled={busy} onClick={() => onAccept(proposal._id)}>
              Accept
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onReject(proposal._id)}>
              Reject
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onSchedule(proposal)}>
              Schedule interview
            </Button>
          </div>
        )}

        {proposal.status === 'accepted' && (
          <div className="wn-proposal-row__actions">
            <Button size="sm" disabled={busy} onClick={() => onSchedule(proposal)}>
              Schedule interview
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
