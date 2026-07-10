import Button from '../../../../components/common/Button';
import Modal from '../../../../components/common/Modal';
import StatusBadge from '../../../../components/jobs/StatusBadge';
import type { Category } from '../../../../types/category';
import { formatDate, formatDateTime } from '../../../../utils/format';
import '../../../../css/DashboardFeatures.css';
import '../../../../css/JobsAdmin.css';
import '../../../../css/CategoriesAdmin.css';

export default function CategoryDetailModal({
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
  const bannerClass = category.isActive ? 'active' : 'inactive';

  return (
    <Modal open bare onClose={onClose} closeOnOverlay ariaLabelledBy="category-modal-title">
      <div className="wn-job-modal" role="document">
        <div className={`wn-job-modal__banner wn-job-modal__banner--${bannerClass}`}>
          <div className="wn-job-modal__top">
            <div>
              <StatusBadge status={category.isActive} kind="category" />
              <h2 id="category-modal-title" className="wn-job-modal__title">
                {category.name}
              </h2>
              <p className="wn-job-modal__slug">{category.slug}</p>
            </div>
            <button
              type="button"
              className="wn-job-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="wn-job-modal__body">
          <div className="wn-job-modal__facts">
            <div className="wn-job-modal__fact">
              <p className="wn-job-modal__fact-label">Status</p>
              <p className="wn-job-modal__fact-value">
                {category.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="wn-job-modal__fact">
              <p className="wn-job-modal__fact-label">Last updated</p>
              <p className="wn-job-modal__fact-value">{formatDate(category.updatedAt)}</p>
            </div>
            <div className="wn-job-modal__fact">
              <p className="wn-job-modal__fact-label">Created</p>
              <p className="wn-job-modal__fact-value">{formatDate(category.createdAt)}</p>
            </div>
          </div>

          {category.description ? (
            <div>
              <p className="wn-job-modal__section-label">Description</p>
              <p className="wn-job-modal__description">{category.description}</p>
            </div>
          ) : (
            <p className="wn-job-modal__description" style={{ margin: 0, fontStyle: 'italic' }}>
              No description provided.
            </p>
          )}

          <p className="wn-job-modal__description" style={{ margin: 0, fontSize: 13 }}>
            Listed {formatDateTime(category.createdAt)}
          </p>
        </div>

        <div className="wn-job-modal__footer">
          <Button size="sm" variant="outline" onClick={onEdit} disabled={busy}>
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={onToggleActive} disabled={busy}>
            {category.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
