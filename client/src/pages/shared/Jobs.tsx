import { useCallback, useEffect, useState } from 'react';
import Pagination from '../../components/common/Pagination';
import PublicJobCard from '../../components/jobs/PublicJobCard';
import PublicJobFilters, { type PublicJobFilterState } from '../../components/jobs/PublicJobFilters';
import { jobsApi } from '../../api/jobs.api';
import { categoriesApi } from '../../api/categories.api';
import type { Category } from '../../types/category';
import type { Job } from '../../types/job';
import '../../css/StaticPage.css';
import '../../css/DashboardFeatures.css';

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<PublicJobFilterState>({
    search: '',
    category: '',
    budgetMin: '',
    budgetMax: '',
    sort: 'newest',
  });

  const loadJobs = useCallback(async () => {
    setLoading(true);

    try {
      const res = await jobsApi.list({
        page,
        limit: 12,
        status: 'open',
        search: filters.search || undefined,
        category: filters.category || undefined,
        budgetMin: Number(filters.budgetMin) || undefined,
        budgetMax: Number(filters.budgetMax) || undefined,
        sort: filters.sort,
      });

      setJobs(res.data.data);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    categoriesApi
      .list({ isActive: true, limit: 100 })
      .then((res) => setCategories(res.data.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleFiltersChange = (next: Partial<PublicJobFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: '', category: '', budgetMin: '', budgetMax: '', sort: 'newest' });
    setPage(1);
  };

  return (
    <div className="wn-static-page">
      <div className="wn-static-page__inner wn-static-page__inner--wide">
        <span className="wn-static-page__eyebrow">Opportunities</span>
        <h1 className="wn-static-page__title">Find Work</h1>
        <p className="wn-static-page__subtitle">
          Browse open jobs posted by clients on WorkNest. Sign up as a freelancer to submit
          proposals and get hired.
        </p>

        <PublicJobFilters
          {...filters}
          categories={categories}
          onChange={handleFiltersChange}
          onClear={resetFilters}
        />

        {loading ? (
          <p className="wn-empty-inline">Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <div className="wn-empty">
            <p className="wn-empty__title">No jobs found</p>
            <p className="wn-empty__desc">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <section className="wn-dash-card-list" style={{ marginBottom: 'var(--space-6)' }}>
              {jobs.map((job) => (
                <PublicJobCard key={job._id} job={job} />
              ))}
            </section>

            {totalPages > 1 && (
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
