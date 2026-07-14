import { useCallback, useEffect, useState } from 'react';
import { Briefcase, CheckCircle2, Clock3, Send } from 'lucide-react';
import Pagination from '../../../components/common/Pagination';
import { jobsApi } from '../../../api/jobs.api';
import { categoriesApi } from '../../../api/categories.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import { BlockLoader } from '../../../components/common/Loader';
import type { Category } from '../../../types/category';
import type { Job } from '../../../types/job';
import type { ListJobsParams } from '../../../types/job';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import JobFilters from '../components/jobs/JobFilters';
import JobList from '../components/jobs/JobList';
import SubmitProposalModal from '../components/proposals/SubmitProposalModal';
import FreelancerStudioShell from '../components/FreelancerStudioShell';
import FreelancerOverview from '../components/FreelancerOverview';
import FreelancerStudioPanel from '../components/FreelancerStudioPanel';
import { fetchAllMyProposalJobIds } from '../utils/proposalJobIds';
import '../../../css/DashboardFeatures.css';
import '../../../css/FreelancerStudio.css';

const JOBS_PAGE_SIZE = 10;

export default function BrowseJobs() {
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  type SortType = NonNullable<ListJobsParams['sort']>;
  const [sort, setSort] = useState<SortType>('newest');
  const [loading, setLoading] = useState(true);
  const [proposalJob, setProposalJob] = useState<Job | null>(null);
  const [submittedJobIds, setSubmittedJobIds] = useState<Set<string>>(new Set());

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsResponse, submittedIds] = await Promise.all([
        jobsApi.list({
          page,
          limit: JOBS_PAGE_SIZE,
          status: 'open',
          search: search || undefined,
          category: category || undefined,
          budgetMin: Number(budgetMin) || undefined,
          budgetMax: Number(budgetMax) || undefined,
          sort,
        }),
        fetchAllMyProposalJobIds(),
      ]);

      setJobs(jobsResponse.data.data);
      setTotalPages(jobsResponse.data.meta?.totalPages || 1);
      setTotalJobs(jobsResponse.data.meta?.total ?? jobsResponse.data.data.length);
      setSubmittedJobIds(submittedIds);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load jobs.'));
    } finally {
      setLoading(false);
    }
  }, [page, search, category, budgetMin, budgetMax, sort, toast]);

  useEffect(() => {
    categoriesApi
      .list({ isActive: true, page: 1, limit: 100 })
      .then((res) => setCategories(res.data.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const filters = { search, category, budgetMin, budgetMax, sort };

  const handleFiltersChange = (next: Partial<typeof filters>) => {
    if (next.search !== undefined) setSearch(next.search);
    if (next.category !== undefined) setCategory(next.category);
    if (next.budgetMin !== undefined) setBudgetMin(next.budgetMin);
    if (next.budgetMax !== undefined) setBudgetMax(next.budgetMax);
    if (next.sort !== undefined) setSort(next.sort);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setBudgetMin('');
    setBudgetMax('');
    setSort('newest');
    setPage(1);
  };

  const appliedOnPage = jobs.filter((job) => submittedJobIds.has(job._id)).length;

  return (
    <FreelancerStudioShell>
      <DashboardPageHeader
        hero
        eyebrow="Freelancer"
        title="Browse jobs"
        subtitle="Explore open projects posted by clients and send tailored proposals."
      />

      <FreelancerOverview
        loading={loading && jobs.length === 0}
        eyebrow="Job board"
        total={totalJobs}
        headline="Open opportunities"
        caption={`${submittedJobIds.size} jobs you've already bid on · ${jobs.length} shown on this page`}
        meterPct={
          totalJobs > 0 ? Math.min(100, Math.round((submittedJobIds.size / totalJobs) * 100)) : 0
        }
        tiles={[
          {
            key: 'open',
            value: totalJobs,
            label: 'Open jobs',
            hint: 'Matching your filters',
            icon: Briefcase,
            tone: 'upcoming',
          },
          {
            key: 'page',
            value: jobs.length,
            label: 'This page',
            hint: `Page ${page} of ${totalPages}`,
            icon: Clock3,
            tone: 'pending',
          },
          {
            key: 'applied',
            value: submittedJobIds.size,
            label: 'Applied',
            hint: 'Total submissions',
            icon: Send,
            tone: 'confirmed',
          },
          {
            key: 'page-applied',
            value: appliedOnPage,
            label: 'On page',
            hint: 'Already submitted here',
            icon: CheckCircle2,
            tone: 'done',
          },
        ]}
      />

      <section className="wn-analytics-card wn-freelancer-studio__toolbar wn-glass-panel">
        <JobFilters
          {...filters}
          categories={categories}
          onChange={handleFiltersChange}
          onClear={resetFilters}
        />
      </section>

      <FreelancerStudioPanel
        title="Open jobs"
        meta={totalPages > 1 ? `Page ${page} of ${totalPages}` : undefined}
      >
        {loading ? (
          <BlockLoader label="Loading jobs..." />
        ) : jobs.length === 0 ? (
          <EmptyState title="No open jobs found" description="Try changing your filters." />
        ) : (
          <>
            <JobList
              jobs={jobs}
              submittedJobIds={submittedJobIds}
              onSubmitProposal={setProposalJob}
            />
            {totalPages > 1 && (
              <div className="wn-freelancer-studio__pagination">
                <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </FreelancerStudioPanel>

      <SubmitProposalModal
        job={proposalJob}
        open={Boolean(proposalJob)}
        onClose={() => setProposalJob(null)}
        onSubmitted={loadJobs}
      />
    </FreelancerStudioShell>
  );
}
