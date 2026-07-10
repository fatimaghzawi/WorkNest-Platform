import { useCallback, useEffect, useState } from 'react';
import Pagination from '../../../components/common/Pagination';
import { jobsApi } from '../../../api/jobs.api';
import { categoriesApi } from '../../../api/categories.api';
import { proposalsApi } from '../../../api/proposals.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import type { Category } from '../../../types/category';
import type { Job } from '../../../types/job';
import type { ListJobsParams } from "../../../types/job";
import type { Proposal } from '../../../types/proposal';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import JobFilters from "../../freelancer/components/jobs/JobFilters";
import JobList from "../../freelancer/components/jobs/JobList";
import SubmitProposalModal from '../components/proposals/SubmitProposalModal';
import '../../../css/DashboardFeatures.css';



export default function BrowseJobs() {
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  type SortType = NonNullable<ListJobsParams["sort"]>;
  const [sort, setSort] = useState<SortType>("newest");

  const [loading, setLoading] = useState(true);
  const [proposalJob, setProposalJob] = useState<Job | null>(null);
  const [submittedJobIds, setSubmittedJobIds] = useState<Set<string>>(new Set());

  const loadJobs = useCallback(async () => {
    setLoading(true);

    try {
      const [jobsResponse, proposalsResponse] = await Promise.all([
        jobsApi.list({
          page,
          limit: 10,
          status: "open",
          search: search || undefined,
          category: category || undefined,
          budgetMin: Number(budgetMin) || undefined,
          budgetMax: Number(budgetMax) || undefined ,
          sort,
        }),
        proposalsApi.getMy({ page: 1, limit: 100 }),
      ]);

      setJobs(jobsResponse.data.data);
      setTotalPages(jobsResponse.data.meta?.totalPages || 1);

      const nextSubmittedJobIds = new Set(
        proposalsResponse.data.data.map((proposal: Proposal) =>
          typeof proposal.jobId === 'string' ? proposal.jobId : proposal.jobId._id
        )
      );
      setSubmittedJobIds(nextSubmittedJobIds);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load jobs.'));
    } finally {
      setLoading(false);
    }

  }, [page, search, category, budgetMin, budgetMax, sort, toast]);

  useEffect(() => {
    categoriesApi
      .list({ isActive: true, limit: 100 })
      .then((res) => setCategories(res.data.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
     loadJobs();
  }, [loadJobs]);

  const filters = {
    search,
    category,
    budgetMin,
    budgetMax,
    sort,
  };

  const handleFiltersChange = (next: Partial<typeof filters>) => {
    if (next.search !== undefined) setSearch(next.search);
    if (next.category !== undefined) setCategory(next.category);
    if (next.budgetMin !== undefined) setBudgetMin(next.budgetMin);
    if (next.budgetMax !== undefined) setBudgetMax(next.budgetMax);
    if (next.sort !== undefined) setSort(next.sort);

    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setBudgetMin("");
    setBudgetMax("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div>
      <DashboardPageHeader
        hero
        eyebrow="Freelancer"
        title="Browse jobs"
        subtitle="Explore open projects posted by clients and send tailored proposals."
      />


      <JobFilters
        {...filters}
        categories={categories}
        onChange={handleFiltersChange}
        onClear={resetFilters}
      />

      <div className="wn-dash-page__card">
        {loading ? (
          <div className="wn-dash-loading">
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No open jobs found"
            description="Try changing your filters."
          />
        ) : (
          <JobList
            jobs={jobs}
            submittedJobIds={submittedJobIds}
            onSubmitProposal={setProposalJob}
          />
        )}

        <SubmitProposalModal
          job={proposalJob}
          open={Boolean(proposalJob)}
          onClose={() => setProposalJob(null)}
          onSubmitted={loadJobs}
        />

        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}