import { formatDate } from '../../../../utils/format';
import StatusBadge from '../../../../components/jobs/StatusBadge';
import type { Category } from '../../../../types/category';
import '../../../../css/CategoriesAdmin.css';

const LANES = [
  { key: 'active' as const, label: 'Active', hint: 'Visible to clients' },
  { key: 'inactive' as const, label: 'Inactive', hint: 'Archived / hidden' },
];

export default function CategoryPipelineBoard({
  categories,
  selectedId,
  onSelect,
  visibleLanes,
}: {
  categories: Category[];
  selectedId?: string | null;
  onSelect: (category: Category) => void;
  visibleLanes?: Array<'active' | 'inactive'>;
}) {
  const lanes = visibleLanes
    ? LANES.filter((lane) => visibleLanes.includes(lane.key))
    : LANES;

  return (
    <div className="wn-category-board" aria-label="Category board">
      {lanes.map((lane) => {
        const laneCategories = categories.filter((cat) =>
          lane.key === 'active' ? cat.isActive : !cat.isActive
        );

        return (
          <section key={lane.key} className={`wn-category-lane wn-category-lane--${lane.key}`}>
            <header className="wn-category-lane__head">
              <div>
                <p className="wn-category-lane__label">{lane.label}</p>
                <p className="wn-category-lane__hint">{lane.hint}</p>
              </div>
              <span className="wn-category-lane__count">{laneCategories.length}</span>
            </header>

            <div className="wn-category-lane__stack">
              {laneCategories.length === 0 ? (
                <p className="wn-category-lane__empty">No categories here</p>
              ) : (
                laneCategories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    className={[
                      'wn-category-ticket',
                      selectedId === category._id ? 'wn-category-ticket--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => onSelect(category)}
                  >
                    <div className="wn-category-ticket__head">
                      <p className="wn-category-ticket__title">{category.name}</p>
                      <StatusBadge status={category.isActive} kind="category" />
                    </div>
                    <p className="wn-category-ticket__slug">{category.slug}</p>
                    {category.description && (
                      <p className="wn-category-ticket__desc">{category.description}</p>
                    )}
                    <p className="wn-category-ticket__date">Updated {formatDate(category.updatedAt)}</p>
                  </button>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
