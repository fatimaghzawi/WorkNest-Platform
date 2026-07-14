import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock3,
  DollarSign,
  Eye,
  LayoutGrid,
  Pencil,
  Trash2,
} from 'lucide-react';
import Button from '../../../../components/common/Button';
import UserAvatar from '../../../../components/users/UserAvatar';
import ProposalStatusBadge from './ProposalStatusBadge';
import { formatCurrency, formatDate } from '../../../../utils/format';
import { getProposalFreelancer } from '../../../../utils/proposal';
import { useAuth } from '../../../../hooks/useAuth';
import type { Proposal } from '../../../../types/proposal';

interface Props {
  proposal: Proposal;
  onView: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onWithdraw: (proposal: Proposal) => void;
}

const STATUS_BRIDGE: Record<Proposal['status'], string> = {
  pending: 'Awaiting reply',
  accepted: 'Matched',
  rejected: 'Closed',
};

export default function ProposalCard({
  proposal,
  onView,
  onEdit,
  onWithdraw,
}: Props) {
  const { user } = useAuth();
  const job = typeof proposal.jobId === 'string' ? undefined : proposal.jobId;
  const client = job?.clientId;
  const populatedFreelancer = getProposalFreelancer(proposal);

  const freelancerFirst =
    populatedFreelancer?.firstName || user?.firstName || 'You';
  const freelancerLast = populatedFreelancer?.lastName || user?.lastName || '';
  const freelancerImage = populatedFreelancer?.profileImage || user?.profileImage;
  const freelancerName = `${freelancerFirst} ${freelancerLast}`.trim() || 'You';

  const clientFirst = client?.firstName || 'Client';
  const clientLast = client?.lastName || '';
  const clientName = `${clientFirst} ${clientLast}`.trim();
  const clientId = client?._id;

  const canOpenWorkspace =
    proposal.status === 'accepted' &&
    Boolean(job?._id) &&
    (job?.status === 'in_progress' || !job?.status);

  return (
    <article className={`wn-duo-card wn-duo-card--${proposal.status}`}>
      <div className="wn-duo-card__badge-row">
        <ProposalStatusBadge status={proposal.status} />
        <span className="wn-duo-card__submitted">{formatDate(proposal.createdAt)}</span>
      </div>

      <div className="wn-duo-card__pair" aria-label={`${freelancerName} and ${clientName}`}>
        <Link
          to="/freelancer/profile"
          className="wn-duo-card__person wn-duo-card__person--you"
          title="Your profile"
        >
          <span className="wn-duo-card__ring">
            <UserAvatar
              firstName={freelancerFirst}
              lastName={freelancerLast || 'F'}
              role="freelancer"
              image={freelancerImage}
              size="lg"
            />
          </span>
          <span className="wn-duo-card__person-name">You</span>
          <span className="wn-duo-card__person-role">Freelancer</span>
        </Link>

        <div className="wn-duo-card__bridge" aria-hidden>
          <span className="wn-duo-card__orbit" />
          <span className="wn-duo-card__pulse" />
          <span className="wn-duo-card__bridge-label">{STATUS_BRIDGE[proposal.status]}</span>
        </div>

        {clientId ? (
          <Link
            to={`/freelancer/clients/${clientId}`}
            className="wn-duo-card__person wn-duo-card__person--client"
            title={`View ${clientName}'s profile`}
          >
            <span className="wn-duo-card__ring">
              <UserAvatar
                firstName={clientFirst}
                lastName={clientLast || 'C'}
                role="client"
                image={client?.profileImage}
                size="lg"
              />
            </span>
            <span className="wn-duo-card__person-name">{clientName}</span>
            <span className="wn-duo-card__person-role">Client</span>
          </Link>
        ) : (
          <div className="wn-duo-card__person wn-duo-card__person--client">
            <span className="wn-duo-card__ring">
              <UserAvatar
                firstName={clientFirst}
                lastName={clientLast || 'C'}
                role="client"
                image={client?.profileImage}
                size="lg"
              />
            </span>
            <span className="wn-duo-card__person-name">{clientName}</span>
            <span className="wn-duo-card__person-role">Client</span>
          </div>
        )}
      </div>

      <div className="wn-duo-card__job">
        {job?.category && <span className="wn-duo-card__category">{job.category}</span>}
        <h3 className="wn-duo-card__title">{job?.title || 'Untitled job'}</h3>
        <p className="wn-duo-card__cover">{proposal.coverLetter}</p>
      </div>

      <div className="wn-duo-card__stats">
        <div className="wn-duo-card__stat">
          <DollarSign size={14} aria-hidden />
          <div>
            <span>Offer</span>
            <strong>{formatCurrency(proposal.price)}</strong>
          </div>
        </div>
        <div className="wn-duo-card__stat">
          <Clock3 size={14} aria-hidden />
          <div>
            <span>Timeline</span>
            <strong>{proposal.timeline}</strong>
          </div>
        </div>
        <div className="wn-duo-card__stat">
          <DollarSign size={14} aria-hidden />
          <div>
            <span>Budget</span>
            <strong>{job?.budget ? formatCurrency(job.budget) : '—'}</strong>
          </div>
        </div>
      </div>

      <div className="wn-duo-card__actions">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Eye size={15} />}
          onClick={() => onView(proposal)}
        >
          View
        </Button>

        {proposal.status === 'pending' && (
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Pencil size={15} />}
              onClick={() => onEdit(proposal)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 size={15} />}
              onClick={() => onWithdraw(proposal)}
            >
              Withdraw
            </Button>
          </>
        )}

        {proposal.status === 'accepted' && (
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CalendarDays size={15} />}
              to="/freelancer/interviews"
            >
              Interviews
            </Button>
            {canOpenWorkspace && job?._id && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<LayoutGrid size={15} />}
                to={`/freelancer/workspace?jobId=${job._id}`}
              >
                Workspace
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
