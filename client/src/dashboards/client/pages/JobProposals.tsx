import { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from 'lucide-react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/features/jobs/StatusBadge';
import { BlockLoader } from '@/components/Loader';
import UserAvatar from '@/features/users/UserAvatar';
import { jobsApi } from '@/api/jobs.api';
import { proposalsApi } from '@/api/proposals.api';
import { projectsApi } from '@/api/projects.api';
import { interviewsApi } from '@/api/interviews.api';
import { matchingApi } from '@/api/matching.api';
import DepositEscrowModal from '@/dashboards/shared/payments/DepositEscrowModal';
import DashboardPageHeader from '@/dashboards/shared/DashboardPageHeader';
import EmptyState from '@/dashboards/shared/EmptyState';
import DashboardStudioShell from '@/dashboards/shared/studio/DashboardStudioShell';
import DashboardOverview from '@/dashboards/shared/studio/DashboardOverview';
import DashboardStudioPanel from '@/dashboards/shared/studio/DashboardStudioPanel';
import FreelancerMatchSuggestions from '@/dashboards/shared/matching/FreelancerMatchSuggestions';
import ScheduleInterviewModal, {
  type PrefillProposal,
} from '@/dashboards/shared/interviews/ScheduleInterviewModal';
import type { Job } from '@/types/job';
import type { Proposal, ProposalStatus } from '@/types/proposal';
import type { FreelancerMatchSuggestion } from '@/types/matching';
import type { CreateInterviewPayload } from '@/types/interview';
import { getApiErrorMessage } from '@/utils/apiError';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/context/ConfirmContext';
import { useCheckoutReturn } from '@/hooks/useCheckoutReturn';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import '@/styles/FreelancerStudio.css';
import '@/styles/DesignSystem.css';
import '@/styles/Proposal.css';
import '@/styles/ClientProposals.css';
import '@/styles/Matching.css';

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
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [depositProject, setDepositProject] = useState<{
    id: string;
    title: string;
    amount: number;
  } | null>(null);
  const [talentSuggestions, setTalentSuggestions] = useState<FreelancerMatchSuggestion[]>([]);
  const [talentHint, setTalentHint] = useState<string | undefined>();

  const loadData = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const [jobRes, proposalsRes, nextCounts, matchRes] = await Promise.all([
        jobsApi.getById(jobId),
        proposalsApi.getByJob(jobId, {
          page,
          limit: PROPOSALS_PAGE_SIZE,
          status: status || undefined,
        }),
        fetchProposalCounts(jobId),
        matchingApi.suggestFreelancers(jobId, { page: 1, limit: 8 }).catch(() => null),
      ]);
      setJob(jobRes.data.data);
      setProposals(proposalsRes.data.data);
      setTotalPages(proposalsRes.data.meta?.totalPages || 1);
      setCounts(nextCounts);
      if (matchRes) {
        setTalentSuggestions(matchRes.data.data?.suggestions || []);
        setTalentHint(matchRes.data.meta?.hint);
      } else {
        setTalentSuggestions([]);
        setTalentHint(undefined);
      }
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

  const selectedFreelancer =
    selectedProposal && typeof selectedProposal.freelancerId === 'object'
      ? selectedProposal.freelancerId
      : null;
  const selectedFreelancerName = selectedFreelancer
    ? `${selectedFreelancer.firstName} ${selectedFreelancer.lastName}`
    : 'Freelancer';
  const selectedFreelancerId =
    selectedFreelancer?._id ||
    (selectedProposal ? String(selectedProposal.freelancerId) : '');
  const selectedProfilePath = `/client/freelancers/${selectedFreelancerId}`;
  const selectedProfileState = {
    from: location.pathname,
    fromLabel: 'Back to proposals',
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

      {!loading && talentSuggestions.length > 0 ? (
        <FreelancerMatchSuggestions suggestions={talentSuggestions} hint={talentHint} />
      ) : null}

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

                    <button
                      type="button"
                      className="wn-freelancer-project-card__hint wn-client-proposal-card__cover-btn"
                      onClick={() => setSelectedProposal(proposal)}
                    >
                      {proposal.coverLetter}
                    </button>

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
                      <Button size="sm" variant="outline" onClick={() => setSelectedProposal(proposal)}>
                        View details
                      </Button>
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

      <Modal
        open={Boolean(selectedProposal)}
        onClose={() => setSelectedProposal(null)}
        title="Proposal details"
        size="lg"
        footer={
          selectedProposal ? (
            <div className="wn-deposit-modal__actions" style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button variant="outline" to={selectedProfilePath} state={selectedProfileState}>
                View profile
              </Button>
              {(selectedProposal.status === 'pending' || selectedProposal.status === 'accepted') && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    const proposal = selectedProposal;
                    setSelectedProposal(null);
                    void openSchedule(proposal);
                  }}
                >
                  Schedule interview
                </Button>
              )}
              {selectedProposal.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    disabled={actingId === selectedProposal._id}
                    onClick={() => {
                      const id = selectedProposal._id;
                      setSelectedProposal(null);
                      void handleStatusChange(id, 'rejected');
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    loading={actingId === selectedProposal._id}
                    onClick={() => {
                      const id = selectedProposal._id;
                      setSelectedProposal(null);
                      void handleStatusChange(id, 'accepted');
                    }}
                  >
                    Accept
                  </Button>
                </>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedProposal && (
          <div className="proposal-details-modal" style={{ boxShadow: 'none', padding: 0, maxWidth: 'none' }}>
            <div className="wn-client-proposal-card__identity" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <UserAvatar
                firstName={selectedFreelancer?.firstName || 'F'}
                lastName={selectedFreelancer?.lastName || 'L'}
                role="freelancer"
                image={selectedFreelancer?.profileImage}
                size="lg"
              />
              <div>
                <h3 className="wn-freelancer-project-card__title" style={{ margin: 0 }}>
                  {selectedFreelancerName}
                </h3>
                <p className="wn-freelancer-project-card__meta" style={{ margin: '4px 0 8px' }}>
                  Submitted {formatDateTime(selectedProposal.createdAt)}
                </p>
                <StatusBadge status={selectedProposal.status} kind="proposal" />
              </div>
            </div>

            {selectedFreelancer?.skills && selectedFreelancer.skills.length > 0 && (
              <div className="wn-dash-skills" style={{ marginBottom: 16 }}>
                {selectedFreelancer.skills.map((skill) => (
                  <span key={skill} className="wn-dash-skill">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {selectedFreelancer?.bio && (
              <div className="proposal-details-modal__section" style={{ marginTop: 0 }}>
                <h4>About</h4>
                <p>{selectedFreelancer.bio}</p>
              </div>
            )}

            <div
              className="proposal-details-modal__section"
              style={{ marginTop: selectedFreelancer?.bio ? undefined : 0 }}
            >
              <h4>Cover letter</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedProposal.coverLetter}</p>
            </div>

            <div
              className="proposal-info"
              style={{ marginTop: 20, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
            >
              <div>
                <span>Bid</span>
                <strong>{formatCurrency(selectedProposal.price)}</strong>
              </div>
              <div>
                <span>Timeline</span>
                <strong>{selectedProposal.timeline}</strong>
              </div>
            </div>

            {selectedFreelancer?.portfolioLink && (
              <div className="proposal-details-modal__section">
                <h4>Portfolio</h4>
                <p>
                  <a href={selectedFreelancer.portfolioLink} target="_blank" rel="noreferrer">
                    {selectedFreelancer.portfolioLink}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

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
