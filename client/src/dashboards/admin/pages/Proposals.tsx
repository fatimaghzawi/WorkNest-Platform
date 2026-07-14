import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, X } from 'lucide-react';
import Pagination from '../../../components/common/Pagination';
import { proposalsApi } from '../../../api/proposals.api';
import { jobsApi } from '../../../api/jobs.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import ProposalQueue from '../components/proposals/ProposalQueue';
import ProposalReviewPanel from '../components/proposals/ProposalReviewPanel';
import ProposalsOverview, { type ProposalPipelineStats } from '../components/proposals/ProposalsOverview';
import type { Proposal, ProposalStatus } from '../../../types/proposal';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const jobIdFilter = searchParams.get('jobId') || '';
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalPipelineStats>(emptyStats);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

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
        limit: 12,
        status: statusFilter === 'all' ? undefined : statusFilter,
        jobId: jobIdFilter || undefined,
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
  }, [page, statusFilter, jobIdFilter, toast]);

  useEffect(() => {
    if (!jobIdFilter) {
      setJobTitle(null);
      return;
    }

    let cancelled = false;
    jobsApi
      .getById(jobIdFilter)
      .then((response) => {
        if (!cancelled) setJobTitle(response.data.data.title);
      })
      .catch(() => {
        if (!cancelled) setJobTitle(null);
      });

    return () => {
      cancelled = true;
    };
  }, [jobIdFilter]);

  useEffect(() => {
    setPage(1);
  }, [jobIdFilter]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

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

  const hasFilters = statusFilter !== 'all' || Boolean(jobIdFilter);

  const clearJobFilter = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('jobId');
    setSearchParams(nextParams, { replace: true });
  };

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
        subtitle="View proposals submitted across all jobs. Clients accept or reject bids from their dashboard."
      />

      <ProposalsOverview
        stats={stats}
        activeFilter={statusFilter}
        onStageClick={handleStageClick}
      />

      <section className="wn-analytics-card wn-proposals-toolbar">
        {jobIdFilter && (
          <div className="wn-proposals-job-filter">
            <span>
              Showing proposals for{' '}
              <strong>{jobTitle || 'this job'}</strong>
            </span>
            <button type="button" className="wn-proposals-job-filter__clear" onClick={clearJobFilter}>
              <X size={14} />
              Clear job filter
            </button>
          </div>
        )}
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
                  ? jobIdFilter
                    ? 'No proposals were submitted for this job with the current filters.'
                    : 'Try another status filter.'
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
                  <span className="wn-wallet-section__meta">
                    Page {page} of {totalPages}
                  </span>
                  <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </section>

        {selectedProposal ? (
          <ProposalReviewPanel proposal={selectedProposal} />
        ) : (
          !loading &&
          proposals.length > 0 && (
            <section className="wn-analytics-card wn-proposal-review wn-proposal-review--empty">
              <p>Select a proposal from the queue to view details.</p>
            </section>
          )
        )}
      </div>
    </div>
  );
}
