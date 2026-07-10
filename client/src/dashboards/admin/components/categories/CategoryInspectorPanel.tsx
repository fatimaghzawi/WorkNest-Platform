import Button from '../../../../components/common/Button';
import StatusBadge from '../../../../components/jobs/StatusBadge';
import type { Category } from '../../../../types/category';
import { formatDate, formatDateTime } from '../../../../utils/format';
import '../../../../css/CategoriesAdmin.css';

export default function CategoryInspectorPanel({
  category,
  onClose,
  onToggleActive,
  onEdit,
  busy,
}: {
  category: Category;
  onClose: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  busy: boolean;
}) {
  return (
    <aside className="wn-analytics-card wn-category-inspector" aria-label={`Category ${category.name}`}>
      <button
        type="button"
        className="wn-category-inspector__close"
        onClick={onClose}
        aria-label="Close category inspector"
      >
        ×
      </button>

      <div className={`wn-category-inspector__hero wn-category-inspector__hero--${category.isActive ? 'active' : 'inactive'}`}>
        <StatusBadge status={category.isActive} kind="category" />
        <h2 className="wn-category-inspector__title">{category.name}</h2>
        <p className="wn-category-inspector__slug">{category.slug}</p>
      </div>

      <div className="wn-category-inspector__body">
        <div className="wn-category-inspector__facts">
          <div>
            <span>Status</span>
            <strong>{category.isActive ? 'Active' : 'Inactive'}</strong>
          </div>
          <div>
            <span>Updated</span>
            <strong>{formatDate(category.updatedAt)}</strong>
          </div>
          <div>
            <span>Created</span>
            <strong>{formatDate(category.createdAt)}</strong>
          </div>
        </div>

        <div>
          <p className="wn-category-inspector__label">Description</p>
          <p className="wn-category-inspector__description">
            {category.description || 'No description provided.'}
          </p>
        </div>

        <p className="wn-category-inspector__meta">Listed {formatDateTime(category.createdAt)}</p>
      </div>

      <div className="wn-category-inspector__footer">
        <Button size="sm" variant="outline" onClick={onEdit} disabled={busy}>
          Edit
        </Button>
        <Button size="sm" variant="outline" onClick={onToggleActive} disabled={busy}>
          {category.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      </div>
    </aside>
  );
}
