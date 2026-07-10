import {
  CalendarDays,
  Clock3,
  DollarSign,
  Building2,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
} from 'lucide-react';
import Button from '../../../../components/common/Button';
import ProposalStatusBadge from './ProposalStatusBadge';
import { formatCurrency, formatDate } from '../../../../utils/format';
import type { Proposal } from '../../../../types/proposal';

interface Props {
  proposal: Proposal;
  onView: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onWithdraw: (proposal: Proposal) => void;
}

export default function ProposalCard({
  proposal,
  onView,
  onEdit,
  onWithdraw,
}: Props) {
  const job = typeof proposal.jobId === 'string' ? undefined : proposal.jobId;
  const client = job?.clientId;
  const canOpenWorkspace =
    proposal.status === 'accepted' &&
    Boolean(job?._id) &&
    (job?.status === 'in_progress' || !job?.status);

  return (
    <article className="proposal-card">
      <div className="proposal-card__header">
        <div className="proposal-card__header-main">
          <p className="proposal-card__eyebrow">Proposal</p>
          <h3>{job?.title || 'Untitled Job'}</h3>

          {client && (
            <p className="proposal-client">
              <Building2 size={15} />
              {client.firstName} {client.lastName}
            </p>
          )}

          {job?.category && <span className="proposal-card__category">{job.category}</span>}
        </div>

        <div className="proposal-card__header-aside">
          <ProposalStatusBadge status={proposal.status} />
        </div>
      </div>

      <div className="proposal-card__body">
        <div className="proposal-cover">
          <p className="proposal-cover__label">Cover letter</p>
          <p className="proposal-cover__text">{proposal.coverLetter}</p>
        </div>

        <div className="proposal-info">
          <div className="proposal-info__item">
            <div className="proposal-info__icon">
              <DollarSign size={16} />
            </div>
            <span>Job budget</span>
            <strong>{job?.budget ? formatCurrency(job.budget) : 'Not set'}</strong>
          </div>

          <div className="proposal-info__item">
            <div className="proposal-info__icon">
              <DollarSign size={16} />
            </div>
            <span>Your offer</span>
            <strong>{formatCurrency(proposal.price)}</strong>
          </div>

          <div className="proposal-info__item">
            <div className="proposal-info__icon">
              <Clock3 size={16} />
            </div>
            <span>Timeline</span>
            <strong>{proposal.timeline}</strong>
          </div>

          <div className="proposal-info__item">
            <div className="proposal-info__icon">
              <CalendarDays size={16} />
            </div>
            <span>Submitted</span>
            <strong>{formatDate(proposal.createdAt)}</strong>
          </div>
        </div>

        <div className="proposal-actions">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye size={16} />}
            onClick={() => onView(proposal)}
          >
            View Details
          </Button>

          {proposal.status === 'pending' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Pencil size={16} />}
                onClick={() => onEdit(proposal)}
              >
                Edit
              </Button>

              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={16} />}
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
                leftIcon={<CalendarDays size={16} />}
                to="/freelancer/interviews"
              >
                Interviews
              </Button>
              {canOpenWorkspace && job?._id && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<LayoutGrid size={16} />}
                  to={`/freelancer/workspace?jobId=${job._id}`}
                >
                  Open workspace
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
