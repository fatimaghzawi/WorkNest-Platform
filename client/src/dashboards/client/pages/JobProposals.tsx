import { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import StatusBadge from '../../../components/jobs/StatusBadge';
import { BlockLoader } from '../../../components/common/Loader';
import UserAvatar from '../../../components/users/UserAvatar';
import { jobsApi } from '../../../api/jobs.api';
import { proposalsApi } from '../../../api/proposals.api';
import { projectsApi } from '../../../api/projects.api';
import { interviewsApi } from '../../../api/interviews.api';
import DepositEscrowModal from '../../_shared/payments/DepositEscrowModal';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import DashboardStudioShell from '../../_shared/studio/DashboardStudioShell';
import DashboardOverview from '../../_shared/studio/DashboardOverview';
import DashboardStudioPanel from '../../_shared/studio/DashboardStudioPanel';
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
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/format';
import '../../../css/FreelancerStudio.css';
import '../../../css/DesignSystem.css';

const FILTERS: { label: string; value: ProposalStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
];

const PROPOSALS_PAGE_SIZE = 9;

async function fetchProposalCounts(jobId: string) {
  const [allRes, pendingRes, acceptedRes, rejectedRes] = await Promise.all([
    proposalsApi.getByJob(jobId, { page: 1, limit: 1 }),
    proposalsApi.getByJob(jobId, { page: 1, limit: 1, status: 'pending' }),
    proposalsApi.getByJob(jobId, { page: 1, limit: 1, status: 'accepted' }),
    proposalsApi.getByJob(jobId, { page: 1, limit: 1, status: 'rejected' }),
  ]);

  return {
    total: allRes.data.meta?.total ?? allRes.data.data.length,
    pending: pendingRes.data.meta?.total ?? 0,
    accepted: acceptedRes.data.meta?.total ?? 0,
    rejected: rejectedRes.data.meta?.total ?? 0,
  };
}

export default function JobProposals() {
  const toast = useToast();
  const confirm = useConfirm();
  const location = useLocation();
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
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
      const [jobRes, proposalsRes, nextCounts] = await Promise.all([
        jobsApi.getById(jobId),
        proposalsApi.getByJob(jobId, {
          page,
          limit: PROPOSALS_PAGE_SIZE,
          status: status || undefined,
        }),
        fetchProposalCounts(jobId),
      ]);
      setJob(jobRes.data.data);
      setProposals(proposalsRes.data.data);
      setTotalPages(proposalsRes.data.meta?.totalPages || 1);
      setCounts(nextCounts);
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
        const projectsRes = await projectsApi.list({ page: 1, limit: 10 });
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

  const countForFilter = (value: ProposalStatus | '') => {
    if (value === '') return counts.total;
    if (value === 'pending') return counts.pending;
    if (value === 'accepted') return counts.accepted;
    return counts.rejected;
  };

  return (
    <DashboardStudioShell>
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

      <DashboardOverview
        loading={loading && proposals.length === 0}
        eyebrow={job?.category || 'Proposal inbox'}
        total={counts.total}
        headline={job?.title || 'Proposals'}
        caption={`Budget ${job ? formatCurrency(job.budget) : '—'} · Due ${job ? formatDate(job.deadline) : '—'}`}
        meterPct={
          counts.total > 0 ? Math.round(((counts.accepted + counts.rejected) / counts.total) * 100) : 0
        }
        tiles={[
          {
            key: 'total',
            value: counts.total,
            label: 'Total',
            hint: 'All submissions',
            icon: FileText,
            tone: 'upcoming',
          },
          {
            key: 'pending',
            value: counts.pending,
            label: 'Pending',
            hint: 'Awaiting decision',
            icon: Clock3,
            tone: 'pending',
          },
          {
            key: 'accepted',
            value: counts.accepted,
            label: 'Accepted',
            hint: 'Hired freelancers',
            icon: CheckCircle2,
            tone: 'confirmed',
          },
          {
            key: 'rejected',
            value: counts.rejected,
            label: 'Rejected',
            hint: 'Closed bids',
            icon: XCircle,
            tone: 'done',
          },
        ]}
      />

      <section className="wn-analytics-card wn-freelancer-studio__toolbar wn-glass-panel">
        <div className="wn-freelancer-studio__pipeline">
          {FILTERS.map((filter) => (
            <button
              key={filter.value || 'all'}
              type="button"
              className={`wn-freelancer-studio__chip${status === filter.value ? ' wn-freelancer-studio__chip--active' : ''}`}
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
            >
              {filter.label}
              <span className="wn-freelancer-studio__chip-count">{countForFilter(filter.value)}</span>
            </button>
          ))}
        </div>
        {job && <StatusBadge status={job.status} kind="job" />}
      </section>

      <DashboardStudioPanel
        title="Incoming proposals"
        meta={totalPages > 1 ? `Page ${page} of ${totalPages}` : undefined}
      >
        {loading ? (
          <BlockLoader label="Loading proposals..." />
        ) : proposals.length === 0 ? (
          <EmptyState
            title="No proposals yet"
            description="Freelancers haven't submitted proposals matching this filter."
          />
        ) : (
          <>
            <div className="wn-freelancer-projects-grid">
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
                  <article key={proposal._id} className="wn-freelancer-project-card wn-glass-card">
                    <header className="wn-freelancer-project-card__header">
                      <div className="wn-client-proposal-card__identity" style={{ display: 'flex', gap: 12 }}>
                        <UserAvatar
                          firstName={freelancer?.firstName || 'F'}
                          lastName={freelancer?.lastName || 'L'}
                          role="freelancer"
                          image={freelancer?.profileImage}
                          size="lg"
                        />
                        <div>
                          <h3 className="wn-freelancer-project-card__title">{freelancerName}</h3>
                          <p className="wn-freelancer-project-card__meta">
                            Submitted {formatDateTime(proposal.createdAt)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={proposal.status} kind="proposal" />
                    </header>

                    {freelancer?.skills && freelancer.skills.length > 0 && (
                      <div className="wn-dash-skills">
                        {freelancer.skills.slice(0, 5).map((skill) => (
                          <span key={skill} className="wn-dash-skill">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="wn-freelancer-project-card__hint" style={{ WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {proposal.coverLetter}
                    </p>

                    <div className="wn-duo-card__stats">
                      <div className="wn-duo-card__stat">
                        <div>
                          <span>Bid</span>
                          <strong>{formatCurrency(proposal.price)}</strong>
                        </div>
                      </div>
                      <div className="wn-duo-card__stat">
                        <div>
                          <span>Timeline</span>
                          <strong>{proposal.timeline}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="wn-freelancer-project-card__actions">
                      <Button size="sm" variant="outline" to={profilePath} state={profileState}>
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
                        <Button size="sm" variant="secondary" onClick={() => openSchedule(proposal)}>
                          Schedule interview
                        </Button>
                      )}
                      {proposal.status === 'accepted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          to={`/client/workspace?jobId=${job?._id}`}
                        >
                          Open workspace
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="wn-freelancer-studio__pagination">
                <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </DashboardStudioPanel>

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
    </DashboardStudioShell>
  );
}
