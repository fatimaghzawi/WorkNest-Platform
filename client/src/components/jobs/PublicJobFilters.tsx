import Button from '../../components/common/Button';
import type { Category } from '../../types/category';
import type { ListJobsParams } from '../../types/job';

export interface PublicJobFilterState {
  search: string;
  category: string;
  budgetMin: string;
  budgetMax: string;
  sort: NonNullable<ListJobsParams['sort']>;
}

interface PublicJobFiltersProps extends PublicJobFilterState {
  categories: Category[];
  onChange: (next: Partial<PublicJobFilterState>) => void;
  onClear: () => void;
}

export default function PublicJobFilters({
  search,
  category,
  budgetMin,
  budgetMax,
  sort,
  categories,
  onChange,
  onClear,
}: PublicJobFiltersProps) {
  return (
    <section className="wn-dash-toolbar">
      <div className="wn-dash-toolbar__group wn-dash-toolbar__group--grow">
        <input
          className="wn-dash-search"
          type="search"
          placeholder="Search jobs by title or keyword..."
          aria-label="Search jobs"
          value={search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div className="wn-dash-toolbar__group">
        <select
          className="wn-dash-select"
          aria-label="Filter by category"
          value={category}
          onChange={(e) => onChange({ category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item._id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>

        <input
          className="wn-dash-search wn-dash-budget-input"
          type="number"
          min={1}
          placeholder="Min Budget"
          aria-label="Minimum budget"
          value={budgetMin}
          onChange={(e) => onChange({ budgetMin: e.target.value })}
        />

        <input
          className="wn-dash-search wn-dash-budget-input"
          type="number"
          min={1}
          placeholder="Max Budget"
          aria-label="Maximum budget"
          value={budgetMax}
          onChange={(e) => onChange({ budgetMax: e.target.value })}
        />

        <select
          className="wn-dash-select"
          aria-label="Sort jobs"
          value={sort}
          onChange={(e) => onChange({ sort: e.target.value as PublicJobFilterState['sort'] })}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="budget_asc">Budget: Low → High</option>
          <option value="budget_desc">Budget: High → Low</option>
        </select>

        <Button size="sm" variant="outline" onClick={onClear}>
          Clear Filters
        </Button>
      </div>
    </section>
  );
}
