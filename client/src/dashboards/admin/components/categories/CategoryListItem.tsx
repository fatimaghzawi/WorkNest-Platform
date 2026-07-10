import type { Category } from '../../../../types/category';
import { formatDate } from '../../../../utils/format';
import '../../../../css/JobsAdmin.css';
import '../../../../css/CategoriesAdmin.css';

export default function CategoryListItem({
  category,
  onSelect,
}: {
  category: Category;
  onSelect: (category: Category) => void;
}) {
  const statusClass = category.isActive ? 'active' : 'inactive';

  return (
    <button
      type="button"
      className={`wn-job-row wn-cat-row--${statusClass}`}
      onClick={() => onSelect(category)}
      aria-label={`Open category ${category.name}`}
    >
      <span className="wn-job-row__rail" aria-hidden />

      <div className="wn-job-row__main">
        <h3 className="wn-job-row__title">{category.name}</h3>
        <div className="wn-job-row__meta">
          <span>{category.isActive ? 'Active' : 'Inactive'}</span>
          {category.description && (
            <>
              <span className="wn-job-row__meta-sep">·</span>
              <span className="wn-cat-row__desc-preview">{category.description}</span>
            </>
          )}
        </div>
      </div>

      <span className="wn-cat-row__slug">{category.slug}</span>
      <span className="wn-job-row__deadline">{formatDate(category.updatedAt)}</span>
    </button>
  );
}
