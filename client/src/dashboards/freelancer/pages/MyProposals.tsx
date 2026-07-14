import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, Clock3, FileText, Send, XCircle } from 'lucide-react';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import Pagination from '../../../components/common/Pagination';
import { BlockLoader } from '../../../components/common/Loader';
import Input from '../../../components/common/Input';
import { useToast } from '../../../hooks/useToast';
import Button from '../../../components/common/Button';
import { proposalsApi } from '../../../api/proposals.api';
import type { Proposal, ProposalStatus } from '../../../types/proposal';
import { getApiErrorMessage } from '../../../utils/apiError';
import FreelancerStudioShell from '../components/FreelancerStudioShell';
import FreelancerOverview from '../components/FreelancerOverview';
import FreelancerStudioPanel from '../components/FreelancerStudioPanel';
import ProposalList from '../components/proposals/ProposalList';
import '../../../css/Proposal.css';
import '../../../css/FreelancerStudio.css';
import '../../../css/DesignSystem.css';

type SortType = 'newest' | 'oldest' | 'priceHigh' | 'priceLow' | 'timeline';

const STATUS_FILTERS: { label: string; value: ProposalStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
];

const PROPOSALS_PAGE_SIZE = 9;

async function fetchMyProposalCounts() {
  const [allRes, pendingRes, acceptedRes, rejectedRes] = await Promise.all([
    proposalsApi.getMy({ page: 1, limit: 1 }),
    proposalsApi.getMy({ page: 1, limit: 1, status: 'pending' }),
    proposalsApi.getMy({ page: 1, limit: 1, status: 'accepted' }),
    proposalsApi.getMy({ page: 1, limit: 1, status: 'rejected' }),
  ]);

  return {
    total: allRes.data.meta?.total ?? 0,
    pending: pendingRes.data.meta?.total ?? 0,
    accepted: acceptedRes.data.meta?.total ?? 0,
    rejected: rejectedRes.data.meta?.total ?? 0,
  };
}

export default function MyProposals() {
  const { success, error: showError } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [editForm, setEditForm] = useState({ coverLetter: '', price: 0, timeline: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProposalStatus | ''>('');
  const [sort, setSort] = useState<SortType>('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProposals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [response, nextCounts] = await Promise.all([
        proposalsApi.getMy({
          page,
          limit: PROPOSALS_PAGE_SIZE,
          status: status || undefined,
        }),
        fetchMyProposalCounts(),
      ]);
      setProposals(response.data.data);
      setTotalPages(response.data.meta?.totalPages || 1);
      setCounts(nextCounts);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load proposals.'));
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    void loadProposals();
  }, [loadProposals]);

  const filteredProposals = useMemo(() => {
    let result = [...proposals];
    if (search.trim()) {
      const keyword = search.toLowerCase();
      result = result.filter((proposal) => {
        const job = typeof proposal.jobId === 'string' ? null : proposal.jobId;
        const client = job?.clientId;
        const searchable = [job?.title, client?.firstName, client?.lastName, proposal.coverLetter]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchable.includes(keyword);
      });
    }
    result.sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'priceHigh') return b.price - a.price;
      if (sort === 'priceLow') return a.price - b.price;
      if (sort === 'timeline') {
        const getDays = (value: string) => Number(value.match(/\d+/)?.[0] || 0);
        return getDays(a.timeline) - getDays(b.timeline);
      }
      return 0;
    });
    return result;
  }, [proposals, search, sort]);

  const countForFilter = (value: ProposalStatus | '') => {
    if (value === '') return counts.total;
    if (value === 'pending') return counts.pending;
    if (value === 'accepted') return counts.accepted;
    return counts.rejected;
  };

  const winRate =
    counts.total > 0 ? Math.round((counts.accepted / counts.total) * 100) : 0;

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setSort('newest');
    setPage(1);
  };

  const handleWithdraw = async () => {
    if (!withdrawId) return;
    try {
      await proposalsApi.withdraw(withdrawId);
      success('Proposal withdrawn successfully.');
      setWithdrawId(null);
      await loadProposals();
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to withdraw proposal.'));
    }
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setEditForm({
      coverLetter: proposal.coverLetter,
      price: proposal.price,
      timeline: proposal.timeline,
    });
  };

  const handleSaveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingProposal) return;
    try {
      await proposalsApi.update(editingProposal._id, editForm);
      success('Proposal updated successfully.');
      setEditingProposal(null);
      await loadProposals();
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to update proposal.'));
    }
  };

  return (
    <FreelancerStudioShell>
      <DashboardPageHeader
        hero
        eyebrow="Freelancer"
        title="My proposals"
        subtitle="Manage your submitted proposals and track your opportunities."
        actions={
          <Button to="/freelancer/jobs" variant="outline">
            Browse jobs
          </Button>
        }
      />

      <FreelancerOverview
        loading={loading && proposals.length === 0}
        eyebrow="Proposal pipeline"
        total={counts.total}
        headline="Proposals submitted"
        caption={`${counts.pending} pending · ${counts.accepted} accepted · ${winRate}% win rate`}
        meterPct={winRate}
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
            hint: 'Awaiting client',
            icon: Clock3,
            tone: 'pending',
          },
          {
            key: 'accepted',
            value: counts.accepted,
            label: 'Accepted',
            hint: 'Won engagements',
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

      {error && (
        <div className="wn-dash-alert wn-dash-alert--error">
          {error}
          <Button size="sm" variant="secondary" onClick={loadProposals}>
            Retry
          </Button>
        </div>
      )}

      <section className="wn-analytics-card wn-freelancer-studio__toolbar wn-glass-panel">
        <div className="wn-freelancer-studio__pipeline">
          {STATUS_FILTERS.map((filter) => (
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
              <span className="wn-freelancer-studio__chip-count">
                {countForFilter(filter.value)}
              </span>
            </button>
          ))}
        </div>
        <div className="wn-freelancer-studio__controls">
          <Input
            placeholder="Search this page..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="wn-freelancer-studio__select"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortType)}
            aria-label="Sort proposals"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priceHigh">Highest price</option>
            <option value="priceLow">Lowest price</option>
            <option value="timeline">Shortest timeline</option>
          </select>
          {(search || status || sort !== 'newest') && (
            <Button size="sm" variant="ghost" onClick={resetFilters}>
              Clear
            </Button>
          )}
        </div>
      </section>

      <FreelancerStudioPanel
        title="Your proposals"
        meta={
          totalPages > 1
            ? `Page ${page} of ${totalPages} · ${filteredProposals.length} on this page`
            : `${filteredProposals.length} on this page`
        }
      >
        {loading ? (
          <BlockLoader label="Loading proposals..." />
        ) : filteredProposals.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No proposals found"
            description="Submit proposals to jobs and they will appear here."
            actionLabel="Browse jobs"
            actionTo="/freelancer/jobs"
          />
        ) : (
          <>
            <ProposalList
              proposals={filteredProposals}
              onView={setSelectedProposal}
              onEdit={handleEdit}
              onWithdraw={(proposal) => setWithdrawId(proposal._id)}
            />
            {totalPages > 1 && (
              <div className="wn-freelancer-studio__pagination">
                <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </FreelancerStudioPanel>

      {selectedProposal && (
        <div className="proposal-confirm-overlay">
          <div className="proposal-details-modal">
            <div className="proposal-details-modal__header">
              <h2>
                {typeof selectedProposal.jobId === 'string'
                  ? 'Proposal details'
                  : selectedProposal.jobId.title}
              </h2>
              <Button variant="ghost" onClick={() => setSelectedProposal(null)}>
                Close
              </Button>
            </div>
            <div className="proposal-details-modal__section">
              <h4>Cover letter</h4>
              <p>{selectedProposal.coverLetter}</p>
            </div>
            <div className="proposal-info">
              <div>
                <span>Your price</span>
                <strong>${selectedProposal.price}</strong>
              </div>
              <div>
                <span>Timeline</span>
                <strong>{selectedProposal.timeline}</strong>
              </div>
            </div>
            {selectedProposal.status === 'accepted' && (
              <div className="proposal-actions" style={{ marginTop: 20 }}>
                <Button variant="outline" size="sm" to="/freelancer/interviews">
                  Interviews
                </Button>
                {typeof selectedProposal.jobId === 'object' &&
                  selectedProposal.jobId?._id &&
                  (selectedProposal.jobId.status === 'in_progress' ||
                    !selectedProposal.jobId.status) && (
                    <Button
                      variant="primary"
                      size="sm"
                      to={`/freelancer/workspace?jobId=${selectedProposal.jobId._id}`}
                    >
                      Open workspace
                    </Button>
                  )}
              </div>
            )}
          </div>
        </div>
      )}

      {editingProposal && (
        <div className="proposal-confirm-overlay">
          <div className="proposal-details-modal">
            <h2>Edit proposal</h2>
            <form className="proposal-edit-form" onSubmit={handleSaveEdit}>
              <label>
                Cover letter
                <textarea
                  value={editForm.coverLetter}
                  onChange={(event) =>
                    setEditForm({ ...editForm, coverLetter: event.target.value })
                  }
                />
              </label>
              <label>
                Price
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(event) =>
                    setEditForm({ ...editForm, price: Number(event.target.value) })
                  }
                />
              </label>
              <label>
                Timeline
                <input
                  value={editForm.timeline}
                  onChange={(event) =>
                    setEditForm({ ...editForm, timeline: event.target.value })
                  }
                />
              </label>
              <div className="proposal-edit-form__actions">
                <Button variant="secondary" type="button" onClick={() => setEditingProposal(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {withdrawId && (
        <div className="proposal-confirm-overlay">
          <div className="proposal-confirm-modal">
            <h3>Withdraw proposal?</h3>
            <p>This action cannot be undone.</p>
            <div>
              <Button variant="secondary" onClick={() => setWithdrawId(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleWithdraw}>
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      )}
    </FreelancerStudioShell>
  );
}
