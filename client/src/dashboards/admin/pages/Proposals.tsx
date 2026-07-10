import { useCallback, useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import Pagination from '../../../components/common/Pagination';
import { interviewsApi } from '../../../api/interviews.api';
import { proposalsApi } from '../../../api/proposals.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import ProposalQueue from '../components/proposals/ProposalQueue';
import ProposalReviewPanel from '../components/proposals/ProposalReviewPanel';
import ProposalsOverview, { type ProposalPipelineStats } from '../components/proposals/ProposalsOverview';
import ScheduleInterviewModal, {
  type PrefillProposal,
} from '../../_shared/interviews/ScheduleInterviewModal';
import type { CreateInterviewPayload } from '../../../types/interview';
import type { Proposal, ProposalStatus } from '../../../types/proposal';
import { getApiErrorMessage } from '../../../utils/apiError';
import { getProposalFreelancer, getProposalJobTitle } from '../../../utils/proposal';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../context/ConfirmContext';
import '../../../css/DesignSystem.css';
import '../../../css/AdminAnalytics.css';
import '../../../css/DashboardFeatures.css';
import '../../../css/ProposalsAdmin.css';

type StatusFilter = ProposalStatus | 'all';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All proposals' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const emptyStats: ProposalPipelineStats = {
  total: 0,
  pending: 0,
  accepted: 0,
  rejected: 0,
};

export default function AdminProposals() {
  const toast = useToast();
  const confirm = useConfirm();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalPipelineStats>(emptyStats);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [prefill, setPrefill] = useState<PrefillProposal | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const response = await proposalsApi.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast.warning(getApiErrorMessage(error, 'Could not refresh proposal overview stats.'));
    }
  }, [toast]);

  const loadProposals = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await proposalsApi.list({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      const nextProposals = response.data.data;
      setProposals(nextProposals);
      setTotalPages(response.data.meta?.totalPages || 1);

      setSelectedProposal((current) => {
        if (!current) return null;
        const next = nextProposals.find((p) => p._id === current._id);
        return next ?? nextProposals[0] ?? null;
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load proposals.'));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, statusFilter, toast]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refreshAll = async (silent = true) => {
    await Promise.all([loadProposals(silent), loadStats()]);
  };

  const handleStageClick = (status: ProposalStatus) => {
    setStatusFilter((current) => (current === status ? 'all' : status));
    setPage(1);
  };

  useEffect(() => {
    if (!loading && proposals.length > 0) {
      setSelectedProposal((current) => {
        if (current && proposals.some((p) => p._id === current._id)) return current;
        return proposals[0];
      });
    } else if (!loading && proposals.length === 0) {
      setSelectedProposal(null);
    }
  }, [loading, proposals]);

  const handleStatusChange = async (
    proposalId: string,
    nextStatus: 'accepted' | 'rejected'
  ) => {
    const proposal = proposals.find((item) => item._id === proposalId);
    const jobTitle = proposal ? getProposalJobTitle(proposal) : 'this job';
    const confirmed = await confirm({
      title: nextStatus === 'accepted' ? 'Accept proposal' : 'Reject proposal',
      message:
        nextStatus === 'accepted'
          ? `Accept this proposal for "${jobTitle}"? The job moves to in progress, a project is created, and other pending proposals are rejected.`
          : 'Reject this proposal? The freelancer will be notified that their submission was declined.',
      confirmLabel: nextStatus === 'accepted' ? 'Accept' : 'Reject',
      variant: nextStatus === 'accepted' ? 'primary' : 'danger',
    });
    if (!confirmed) return;

    setActionBusy(true);
    try {
      const response = await proposalsApi.updateStatus(proposalId, nextStatus);
      const updated = response.data.data;
      setProposals((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
      setSelectedProposal(updated);
      if (nextStatus === 'accepted') {
        toast.success('Proposal accepted. Job is in progress and workspace is ready.');
      } else {
        toast.success('Proposal rejected.');
      }
      void loadStats();
      void loadProposals(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update proposal.'));
    } finally {
      setActionBusy(false);
    }
  };

  const openSchedule = (proposal: Proposal) => {
    const job = proposal.jobId && typeof proposal.jobId === 'object' ? proposal.jobId : null;
    const freelancer = getProposalFreelancer(proposal);
    setPrefill({
      proposalId: proposal._id,
      jobId: job?._id || String(proposal.jobId),
      jobTitle: job?.title || 'Job',
      freelancerId: freelancer?._id || String(proposal.freelancerId),
      freelancerName: freelancer
        ? `${freelancer.firstName} ${freelancer.lastName}`
        : 'Freelancer',
    });
    setScheduleOpen(true);
  };

  const handleSchedule = async (payload: CreateInterviewPayload) => {
    try {
      await interviewsApi.create(payload);
      toast.success('Interview scheduled.');
      setScheduleOpen(false);
      setPrefill(null);
      await refreshAll(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to schedule interview.'));
      throw err;
    }
  };

  const hasFilters = statusFilter !== 'all';

  if (loading && proposals.length === 0) {
    return (
      <div className="wn-analytics">
        <DashboardPageHeader
          hero
          eyebrow="Admin"
          title="Proposal management"
          subtitle="Loading submissions..."
        />
        <div className="wn-proposals-overview wn-proposals-overview--loading" aria-hidden>
          <div className="wn-proposals-overview__spotlight" />
          <div className="wn-proposals-overview__tiles">
            <div className="wn-proposals-overview__tile" />
            <div className="wn-proposals-overview__tile" />
            <div className="wn-proposals-overview__tile" />
            <div className="wn-proposals-overview__tile" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wn-analytics">
      <DashboardPageHeader
        hero
        eyebrow="Admin"
        title="Proposal management"
        subtitle="Review and manage proposals submitted across all jobs."
      />

      <ProposalsOverview
        stats={stats}
        activeFilter={statusFilter}
        onStageClick={handleStageClick}
      />

      <section className="wn-analytics-card wn-proposals-toolbar">
        <div className="wn-proposals-filters">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`wn-proposals-chip ${statusFilter === filter.value ? 'wn-proposals-chip--active' : ''}`}
              onClick={() => { setStatusFilter(filter.value); setPage(1); }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <div className="wn-analytics__layout wn-proposals-studio">
        <section className="wn-analytics-card wn-proposals-queue-wrap">
          {loading ? (
            <div className="wn-proposals-queue-skeleton" aria-hidden>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} />
              ))}
            </div>
          ) : proposals.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={hasFilters ? 'No proposals match your filters' : 'No proposals found'}
              description={
                hasFilters
                  ? 'Try another status filter.'
                  : 'Proposals will appear here once freelancers start applying.'
              }
            />
          ) : (
            <>
              <ProposalQueue
                proposals={proposals}
                selectedId={selectedProposal?._id}
                onSelect={setSelectedProposal}
              />
              {totalPages > 1 && (
                <div className="wn-proposals-pagination">
                  <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </section>

        {selectedProposal ? (
          <ProposalReviewPanel
            proposal={selectedProposal}
            busy={actionBusy}
            onAccept={(id) => handleStatusChange(id, 'accepted')}
            onReject={(id) => handleStatusChange(id, 'rejected')}
            onSchedule={openSchedule}
          />
        ) : (
          !loading &&
          proposals.length > 0 && (
            <section className="wn-analytics-card wn-proposal-review wn-proposal-review--empty">
              <p>Select a proposal from the queue to review it.</p>
            </section>
          )
        )}
      </div>

      <ScheduleInterviewModal
        open={scheduleOpen}
        mode="admin"
        prefill={prefill}
        onClose={() => {
          setScheduleOpen(false);
          setPrefill(null);
        }}
        onScheduled={handleSchedule}
      />
    </div>
  );
}
