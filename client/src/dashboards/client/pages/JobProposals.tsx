import { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import StatusBadge from '../../../components/jobs/StatusBadge';
import { jobsApi } from '../../../api/jobs.api';
import { proposalsApi } from '../../../api/proposals.api';
import { projectsApi } from '../../../api/projects.api';
import { interviewsApi } from '../../../api/interviews.api';
import DepositEscrowModal from '../../_shared/payments/DepositEscrowModal';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import ScheduleInterviewModal, {
  type PrefillProposal,
} from '../../_shared/interviews/ScheduleInterviewModal';
import type { Job } from '../../../types/job';
import type { Proposal, ProposalStatus } from '../../../types/proposal';
import type { CreateInterviewPayload } from '../../../types/interview';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../context/ConfirmContext';
import { useCheckoutReturn } from '../../../hooks/useCheckoutReturn';
import { formatCurrency, formatDate, formatDateTime, getInitials } from '../../../utils/format';
import '../../../css/DashboardFeatures.css';

const FILTERS: { label: string; value: ProposalStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
];

export default function JobProposals() {
  const toast = useToast();
  const confirm = useConfirm();
  const location = useLocation();
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [counts, setCounts] = useState<{ total: number; pending: number; accepted: number; rejected: number }>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  const [status, setStatus] = useState<ProposalStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [prefill, setPrefill] = useState<PrefillProposal | null>(null);
  const [depositProject, setDepositProject] = useState<{
    id: string;
    title: string;
    amount: number;
  } | null>(null);

  const loadData = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const [jobRes, proposalsRes, allRes] = await Promise.all([
        jobsApi.getById(jobId),
        proposalsApi.getByJob(jobId, { page, limit: 9, status: status || undefined }),
        proposalsApi.getByJob(jobId, { page: 1, limit: 100 }),
      ]);
      setJob(jobRes.data.data);
      setProposals(proposalsRes.data.data);
      setTotalPages(proposalsRes.data.meta?.totalPages || 1);

      const all = allRes.data.data || [];
      setCounts({
        total: all.length,
        pending: all.filter((p) => p.status === 'pending').length,
        accepted: all.filter((p) => p.status === 'accepted').length,
        rejected: all.filter((p) => p.status === 'rejected').length,
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load proposals.'));
    } finally {
      setLoading(false);
    }
  }, [jobId, page, status, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useCheckoutReturn(loadData);

  const handleStatusChange = async (proposalId: string, nextStatus: 'accepted' | 'rejected') => {
    const proposal = proposals.find((item) => item._id === proposalId);
    const freelancer =
      proposal && typeof proposal.freelancerId === 'object' ? proposal.freelancerId : null;
    const freelancerName = freelancer
      ? `${freelancer.firstName} ${freelancer.lastName}`
      : 'this freelancer';

    const confirmed = await confirm({
      title: nextStatus === 'accepted' ? 'Accept proposal' : 'Reject proposal',
      message:
        nextStatus === 'accepted'
          ? `Accept ${freelancerName}'s proposal for "${job?.title || 'this job'}"? The job moves to in progress, a project is created, and other pending proposals are rejected.`
          : `Reject ${freelancerName}'s proposal? They will be notified that their submission was declined.`,
      confirmLabel: nextStatus === 'accepted' ? 'Accept' : 'Reject',
      variant: nextStatus === 'accepted' ? 'primary' : 'danger',
    });
    if (!confirmed) return;

    setActingId(proposalId);
    try {
      await proposalsApi.updateStatus(proposalId, nextStatus);
      if (nextStatus === 'accepted') {
        toast.success('Proposal accepted. Deposit funds to escrow so the freelancer can start.');
        const projectsRes = await projectsApi.list({ limit: 50 });
        const project = projectsRes.data.data.find((item) => item.jobId === jobId);
        if (project && project.escrowStatus === 'pending' && project.contractAmount) {
          setDepositProject({
            id: project.id,
            title: project.jobTitle || project.title,
            amount: project.contractAmount,
          });
        }
      } else {
        toast.success('Proposal rejected.');
      }
      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update proposal.'));
    } finally {
      setActingId(null);
    }
  };

  const openSchedule = async (proposal: Proposal) => {
    if (!job) return;
    const freelancer =
      typeof proposal.freelancerId === 'object' ? proposal.freelancerId : null;
    const freelancerName = freelancer
      ? `${freelancer.firstName} ${freelancer.lastName}`
      : 'the freelancer';

    const confirmed = await confirm({
      title: 'Schedule interview',
      message: `Schedule an interview with ${freelancerName} for "${job.title}"?`,
      confirmLabel: 'Continue',
      variant: 'primary',
    });
    if (!confirmed) return;

    setPrefill({
      proposalId: proposal._id,
      jobId: job._id,
      jobTitle: job.title,
      freelancerId: freelancer?._id || String(proposal.freelancerId),
      freelancerName,
    });
    setScheduleOpen(true);
  };

  const handleSchedule = async (payload: CreateInterviewPayload) => {
    await interviewsApi.create(payload);
    toast.success('Interview scheduled. The freelancer can confirm from their calendar.');
  };

  return (
    <div>
      <DashboardPageHeader
        hero
        eyebrow="Client"
        title="Job proposals"
        subtitle="Review freelancer proposals and accept the best fit for your job."
        actions={
          <Button variant="outline" to="/client/jobs">
            ← Back to my jobs
          </Button>
        }
      />

      {job && (
        <div className="wn-job-detail__hero">
          <div className="wn-job-detail__hero-top">
            <div>
              <div className="wn-job-detail__hero-eyebrow">{job.category}</div>
              <h2 className="wn-job-detail__hero-title">{job.title}</h2>
            </div>
            <StatusBadge status={job.status} kind="job" />
          </div>
          <div className="wn-job-detail__hero-meta">
            <div className="wn-job-detail__hero-meta-item">
              <span className="wn-job-detail__hero-meta-label">Budget</span>
              <span className="wn-job-detail__hero-meta-value">{formatCurrency(job.budget)}</span>
            </div>
            <div className="wn-job-detail__hero-meta-item">
              <span className="wn-job-detail__hero-meta-label">Deadline</span>
              <span className="wn-job-detail__hero-meta-value">{formatDate(job.deadline)}</span>
            </div>
            <div className="wn-job-detail__hero-meta-item">
              <span className="wn-job-detail__hero-meta-label">Proposals</span>
              <span className="wn-job-detail__hero-meta-value">{counts.total}</span>
            </div>
          </div>
        </div>
      )}

      <div className="wn-proposal-filter-bar">
        {FILTERS.map((filter) => (
          <button
            key={filter.value || 'all'}
            type="button"
            className={`wn-proposal-filter-tab${status === filter.value ? ' wn-proposal-filter-tab--active' : ''}`}
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
          >
            {filter.label}
            <span className="wn-proposal-filter-tab__count">
              {filter.value === ''
                ? counts.total
                : filter.value === 'pending'
                  ? counts.pending
                  : filter.value === 'accepted'
                    ? counts.accepted
                    : counts.rejected}
            </span>
          </button>
        ))}
      </div>

      <div className="wn-dash-page__card">
        {loading ? (
          <p>Loading proposals...</p>
        ) : proposals.length === 0 ? (
          <EmptyState
            title="No proposals yet"
            description="Freelancers haven't submitted proposals matching this filter."
          />
        ) : (
          <>
            <div className="wn-proposal-grid">
              {proposals.map((proposal) => {
                const freelancer =
                  typeof proposal.freelancerId === 'object' ? proposal.freelancerId : null;
                const freelancerName = freelancer
                  ? `${freelancer.firstName} ${freelancer.lastName}`
                  : 'Freelancer';
                const freelancerId = freelancer?._id || String(proposal.freelancerId);
                const profilePath = `/client/freelancers/${freelancerId}`;
                const profileState = {
                  from: location.pathname,
                  fromLabel: 'Back to proposals',
                };

                return (
                  <article key={proposal._id} className="wn-proposal-card">
                    <div className="wn-proposal-card__header">
                      <div className="wn-proposal-card__identity">
                        <span className="wn-avatar wn-avatar--lg">{getInitials(freelancerName)}</span>
                        <div>
                          <h3 className="wn-proposal-card__name">{freelancerName}</h3>
                          <p className="wn-proposal-card__submitted">
                            Submitted {formatDateTime(proposal.createdAt)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={proposal.status} kind="proposal" />
                    </div>

                    {freelancer?.skills && freelancer.skills.length > 0 && (
                      <div className="wn-dash-skills" style={{ marginBottom: 12 }}>
                        {freelancer.skills.slice(0, 6).map((skill) => (
                          <span key={skill} className="wn-dash-skill">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="wn-proposal-card__cover">{proposal.coverLetter}</p>

                    <div className="wn-proposal-card__stats">
                      <div className="wn-proposal-card__stat">
                        <span className="wn-proposal-card__stat-label">Bid price</span>
                        <span className="wn-proposal-card__stat-value">
                          {formatCurrency(proposal.price)}
                        </span>
                      </div>
                      <div className="wn-proposal-card__stat">
                        <span className="wn-proposal-card__stat-label">Timeline</span>
                        <span className="wn-proposal-card__stat-value">{proposal.timeline}</span>
                      </div>
                    </div>

                    <div className="wn-dash-table__actions" style={{ marginTop: 16 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        to={profilePath}
                        state={profileState}
                      >
                        View profile
                      </Button>
                      {proposal.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            loading={actingId === proposal._id}
                            onClick={() => handleStatusChange(proposal._id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actingId === proposal._id}
                            onClick={() => handleStatusChange(proposal._id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {(proposal.status === 'pending' || proposal.status === 'accepted') && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openSchedule(proposal)}
                        >
                          Schedule interview
                        </Button>
                      )}
                      {proposal.status === 'accepted' && (
                        <Button size="sm" variant="outline" to={`/client/workspace?jobId=${job?._id}`}>
                          Open workspace
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {totalPages > 1 && (
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      <ScheduleInterviewModal
        open={scheduleOpen}
        prefill={prefill}
        onClose={() => {
          setScheduleOpen(false);
          setPrefill(null);
        }}
        onScheduled={handleSchedule}
      />

      {depositProject && (
        <DepositEscrowModal
          open={Boolean(depositProject)}
          projectId={depositProject.id}
          projectTitle={depositProject.title}
          amount={depositProject.amount}
          returnPath={jobId ? `/client/jobs/${jobId}/proposals` : '/client/payments'}
          onClose={() => setDepositProject(null)}
        />
      )}
    </div>
  );
}