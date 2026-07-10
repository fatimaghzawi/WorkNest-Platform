import Button from '../../../../components/common/Button';
import StatusBadge from '../../../../components/jobs/StatusBadge';
import UserAvatar from '../../../../components/users/UserAvatar';
import type { Proposal } from '../../../../types/proposal';
import { formatCurrency, formatDateTime } from '../../../../utils/format';
import { getProposalFreelancer, getProposalJobTitle } from '../../../../utils/proposal';
import '../../../../css/ProposalsAdmin.css';

export default function ProposalCard({
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
  const freelancer = getProposalFreelancer(proposal);
  const coverPreview =
    proposal.coverLetter.length > 120
      ? `${proposal.coverLetter.slice(0, 120).trim()}…`
      : proposal.coverLetter;

  return (
    <article className={`wn-proposal-card wn-proposal-card--${proposal.status}`}>
      <div className="wn-proposal-card__header">
        <StatusBadge status={proposal.status} kind="proposal" />
        <span className="wn-proposal-card__time">{formatDateTime(proposal.createdAt)}</span>
      </div>

      <h3 className="wn-proposal-card__job">{getProposalJobTitle(proposal)}</h3>

      <div className="wn-proposal-card__freelancer">
        {freelancer ? (
          <>
            <UserAvatar
              firstName={freelancer.firstName ?? ''}
              lastName={freelancer.lastName ?? ''}
              role="freelancer"
              image={freelancer.profileImage}
              size="sm"
            />
            <div>
              <p className="wn-proposal-card__name">
                {freelancer.firstName} {freelancer.lastName}
              </p>
              <p className="wn-proposal-card__role">Freelancer</p>
            </div>
          </>
        ) : (
          <p className="wn-proposal-card__name">Freelancer</p>
        )}
      </div>

      <p className="wn-proposal-card__cover">{coverPreview}</p>

      <div className="wn-proposal-card__metrics">
        <div>
          <p className="wn-proposal-card__metric-label">Bid</p>
          <p className="wn-proposal-card__metric-value">{formatCurrency(proposal.price ?? 0)}</p>
        </div>
        <div>
          <p className="wn-proposal-card__metric-label">Timeline</p>
          <p className="wn-proposal-card__metric-value">{proposal.timeline}</p>
        </div>
      </div>

      {proposal.status === 'pending' && (
        <div className="wn-proposal-card__actions">
          <Button size="sm" disabled={busy} onClick={() => onAccept(proposal._id)}>
            Accept
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onReject(proposal._id)}>
            Reject
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onSchedule(proposal)}>
            Interview
          </Button>
        </div>
      )}

        {proposal.status === 'accepted' && (
          <div className="wn-proposal-card__actions">
            <Button size="sm" disabled={busy} onClick={() => onSchedule(proposal)}>
              Schedule interview
            </Button>
          </div>
        )}
    </article>
  );
}
