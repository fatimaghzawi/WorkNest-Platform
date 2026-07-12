import StatusBadge from '../../../../components/jobs/StatusBadge';
import UserAvatar from '../../../../components/users/UserAvatar';
import type { Proposal } from '../../../../types/proposal';
import { formatCurrency, formatDateTime } from '../../../../utils/format';
import { getProposalFreelancer, getProposalJobTitle } from '../../../../utils/proposal';
import '../../../../css/ProposalsAdmin.css';

export default function ProposalReviewPanel({ proposal }: { proposal: Proposal }) {
  const freelancer = getProposalFreelancer(proposal);

  return (
    <section className="wn-analytics-card wn-proposal-review" aria-label="Proposal review">
      <div className={`wn-proposal-review__hero wn-proposal-review__hero--${proposal.status}`}>
        <div className="wn-proposal-review__hero-top">
          <StatusBadge status={proposal.status} kind="proposal" />
          <span className="wn-proposal-review__time">{formatDateTime(proposal.createdAt)}</span>
        </div>
        <h2 className="wn-proposal-review__job">{getProposalJobTitle(proposal)}</h2>
        <p className="wn-proposal-review__id">Proposal #{proposal._id.slice(-8).toUpperCase()}</p>
      </div>

      <div className="wn-proposal-review__body">
        <div className="wn-proposal-review__freelancer">
          {freelancer ? (
            <>
              <UserAvatar
                firstName={freelancer.firstName ?? ''}
                lastName={freelancer.lastName ?? ''}
                role="freelancer"
                image={freelancer.profileImage}
                size="lg"
              />
              <div>
                <p className="wn-proposal-review__name">
                  {freelancer.firstName} {freelancer.lastName}
                </p>
                <p className="wn-proposal-review__email">{freelancer.email || 'Freelancer'}</p>
              </div>
            </>
          ) : (
            <p className="wn-proposal-review__name">Freelancer</p>
          )}
        </div>

        <div className="wn-proposal-review__metrics">
          <article>
            <p>Bid amount</p>
            <strong>{formatCurrency(proposal.price ?? 0)}</strong>
          </article>
          <article>
            <p>Timeline</p>
            <strong>{proposal.timeline}</strong>
          </article>
        </div>

        <div className="wn-proposal-review__letter-wrap">
          <p className="wn-proposal-review__label">Cover letter</p>
          <blockquote className="wn-proposal-review__letter">{proposal.coverLetter}</blockquote>
        </div>
      </div>
    </section>
  );
}
