import { useCallback, useEffect, useMemo, useState } from 'react';
import { Tags } from 'lucide-react';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { categoriesApi } from '../../../api/categories.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import CategoriesOverview, {
  type CategoryPipelineStats,
} from '../components/categories/CategoriesOverview';
import CategoryPipelineBoard from '../components/categories/CategoryPipelineBoard';
import CategoryInspectorPanel from '../components/categories/CategoryInspectorPanel';
import CategoryFormModal from '../components/categories/CategoryFormModal';
import type { Category, CreateCategoryPayload } from '../../../types/category';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useToast } from '../../../hooks/useToast';
import '../../../css/DesignSystem.css';
import '../../../css/AdminAnalytics.css';
import '../../../css/DashboardFeatures.css';
import '../../../css/CategoriesAdmin.css';

type ActiveFilter = 'all' | 'active' | 'inactive';

const STATUS_FILTERS: { value: ActiveFilter; label: string }[] = [
  { value: 'all', label: 'All categories' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const emptyStats: CategoryPipelineStats = {
  total: 0,
  active: 0,
  inactive: 0,
};

export default function AdminCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryPipelineStats>(emptyStats);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  const listParams = useMemo(
    () => ({
      page,
      limit: activeFilter === 'all' ? 24 : 15,
      search: debouncedSearch.trim() || undefined,
      isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
    }),
    [page, debouncedSearch, activeFilter]
  );

  const loadStats = useCallback(async () => {
    try {
      const [totalRes, activeRes] = await Promise.all([
        categoriesApi.list({ limit: 1 }),
        categoriesApi.list({ limit: 1, isActive: true }),
      ]);
      const total = totalRes.data.meta?.total ?? 0;
      const active = activeRes.data.meta?.total ?? 0;
      setStats({ total, active, inactive: Math.max(0, total - active) });
    } catch (error) {
      toast.warning(getApiErrorMessage(error, 'Could not refresh category overview stats.'));
    }
  }, [toast]);

  const loadCategories = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await categoriesApi.list(listParams);
      const nextCategories = response.data.data;
      setCategories(nextCategories);
      setTotalPages(response.data.meta?.totalPages || 1);

      setSelectedCategory((current) => {
        if (!current) return null;
        return nextCategories.find((cat) => cat._id === current._id) ?? current;
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load categories.'));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [listParams, toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!loading && categories.length > 0) {
      setSelectedCategory((current) => {
        if (current && categories.some((cat) => cat._id === current._id)) return current;
        return categories[0];
      });
    } else if (!loading && categories.length === 0) {
      setSelectedCategory(null);
    }
  }, [loading, categories]);

  const refreshAll = async (silent = true) => {
    await Promise.all([loadCategories(silent), loadStats()]);
  };

  const handleStageClick = (filter: 'active' | 'inactive') => {
    setActiveFilter((current) => (current === filter ? 'all' : filter));
    setPage(1);
  };

  const handleToggleActive = async (category: Category) => {
    setActionBusy(true);
    try {
      const response = await categoriesApi.update(category._id, {
        isActive: !category.isActive,
      });
      const updated = response.data.data;
      setCategories((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
      setSelectedCategory(updated);
      toast.success(
        category.isActive
          ? `"${category.name}" deactivated.`
          : `"${category.name}" activated.`
      );
      void loadStats();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update category.'));
    } finally {
      setActionBusy(false);
    }
  };

  const visibleLanes =
    activeFilter === 'all' ? undefined : [activeFilter];

  const hasFilters = Boolean(debouncedSearch.trim()) || activeFilter !== 'all';

  if (loading && categories.length === 0) {
    return (
      <div className="wn-analytics">
        <DashboardPageHeader
          hero
          eyebrow="Admin"
          title="Category management"
          subtitle="Loading catalog..."
        />
        <div className="wn-categories-overview wn-categories-overview--loading" aria-hidden>
          <div className="wn-categories-overview__spotlight" />
          <div className="wn-categories-overview__tiles">
            <div className="wn-categories-overview__tile" />
            <div className="wn-categories-overview__tile" />
            <div className="wn-categories-overview__tile" />
            <div className="wn-categories-overview__tile" />
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
        title="Category management"
        subtitle="Manage job categories — active listings clients can use, and inactive ones kept archived."
        actions={
          <Button onClick={() => { setCreating(true); setEditing(null); setSelectedCategory(null); }}>
            New category
          </Button>
        }
      />

      <CategoriesOverview
        stats={stats}
        activeFilter={activeFilter}
        onStageClick={handleStageClick}
      />

      <section className="wn-analytics-card wn-categories-toolbar">
        <input
          className="wn-dash-search wn-categories-search"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          aria-label="Search categories"
        />
        <div className="wn-categories-filters">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`wn-categories-chip ${activeFilter === filter.value ? 'wn-categories-chip--active' : ''}`}
              onClick={() => { setActiveFilter(filter.value); setPage(1); }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <div className="wn-analytics__layout wn-categories-studio">
        <section className="wn-analytics-card wn-categories-board-wrap">
          {loading ? (
            <div className="wn-categories-board-skeleton" aria-hidden>
              <div />
              <div />
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={Tags}
              title={hasFilters ? 'No categories match your filters' : 'No categories yet'}
              description={
                hasFilters
                  ? 'Try another filter or adjust your search.'
                  : 'Create the first category for clients to use when posting jobs.'
              }
              actionLabel={hasFilters ? undefined : 'New category'}
              onAction={hasFilters ? undefined : () => setCreating(true)}
            />
          ) : (
            <>
              <CategoryPipelineBoard
                categories={categories}
                selectedId={selectedCategory?._id}
                onSelect={setSelectedCategory}
                visibleLanes={visibleLanes}
              />
              {totalPages > 1 && (
                <div className="wn-categories-pagination">
                  <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </section>

        {selectedCategory && !creating && !editing && (
          <CategoryInspectorPanel
            category={selectedCategory}
            onClose={() => setSelectedCategory(null)}
            onToggleActive={() => handleToggleActive(selectedCategory)}
            onEdit={() => { setEditing(selectedCategory); setCreating(false); }}
            busy={actionBusy}
          />
        )}
      </div>

      {(creating || editing) && (
        <CategoryFormModal
          title={editing ? 'Edit category' : 'New category'}
          initialCategory={editing || undefined}
          submitLabel={editing ? 'Save changes' : 'Create category'}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (payload) => {
            try {
              if (editing) {
                const response = await categoriesApi.update(editing._id, payload);
                toast.success('Category updated successfully.');
                setSelectedCategory(response.data.data);
              } else {
                await categoriesApi.create(payload as CreateCategoryPayload);
                toast.success('Category created successfully.');
              }
              setCreating(false);
              setEditing(null);
              await refreshAll(true);
            } catch (err) {
              toast.error(
                getApiErrorMessage(err, editing ? 'Failed to update category.' : 'Failed to create category.')
              );
              throw err;
            }
          }}
        />
      )}
    </div>
  );
}
