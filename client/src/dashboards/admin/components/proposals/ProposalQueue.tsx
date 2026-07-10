import UserAvatar from '../../../../components/users/UserAvatar';
import type { Proposal } from '../../../../types/proposal';
import { formatCurrency } from '../../../../utils/format';
import { getProposalFreelancer, getProposalJobTitle } from '../../../../utils/proposal';
import '../../../../css/ProposalsAdmin.css';

export default function ProposalQueue({
  proposals,
  selectedId,
  onSelect,
}: {
  proposals: Proposal[];
  selectedId?: string | null;
  onSelect: (proposal: Proposal) => void;
}) {
  return (
    <nav className="wn-proposal-queue" aria-label="Proposal queue">
      <p className="wn-proposal-queue__title">Review queue</p>
      <ol className="wn-proposal-queue__list">
        {proposals.map((proposal, index) => {
          const freelancer = getProposalFreelancer(proposal);
          const isLast = index === proposals.length - 1;

          return (
            <li key={proposal._id} className="wn-proposal-queue__item-wrap">
              <button
                type="button"
                className={[
                  'wn-proposal-queue__item',
                  `wn-proposal-queue__item--${proposal.status}`,
                  selectedId === proposal._id ? 'wn-proposal-queue__item--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelect(proposal)}
              >
                <span className="wn-proposal-queue__rail" aria-hidden>
                  <span className={`wn-proposal-queue__dot wn-proposal-queue__dot--${proposal.status}`} />
                  {!isLast && <span className="wn-proposal-queue__line" />}
                </span>

                <span className="wn-proposal-queue__content">
                  {freelancer ? (
                    <UserAvatar
                      firstName={freelancer.firstName ?? ''}
                      lastName={freelancer.lastName ?? ''}
                      role="freelancer"
                      image={freelancer.profileImage}
                      size="sm"
                    />
                  ) : (
                    <span className="wn-proposal-queue__avatar-fallback">FL</span>
                  )}

                  <span className="wn-proposal-queue__copy">
                    <span className="wn-proposal-queue__job">{getProposalJobTitle(proposal)}</span>
                    <span className="wn-proposal-queue__meta">
                      {freelancer
                        ? `${freelancer.firstName ?? ''} ${freelancer.lastName ?? ''}`.trim() || 'Freelancer'
                        : 'Freelancer'}
                      {' · '}
                      {formatCurrency(proposal.price ?? 0)}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
