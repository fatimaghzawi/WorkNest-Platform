import CategoryForm from '../../../../components/categories/CategoryForm';
import Modal from '../../../../components/common/Modal';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../../../../types/category';
import '../../../../css/JobsAdmin.css';

export default function CategoryFormModal({
  title,
  initialCategory,
  submitLabel,
  onSubmit,
  onClose,
}: {
  title: string;
  initialCategory?: Category;
  submitLabel: string;
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => Promise<void>;
  onClose: () => void;
}) {
  return (
    <Modal open bare onClose={onClose} closeOnOverlay ariaLabelledBy="category-form-title">
      <div className="wn-job-modal" role="document">
        <div className="wn-job-modal__banner wn-job-modal__banner--active">
          <div className="wn-job-modal__top">
            <h2 id="category-form-title" className="wn-job-modal__title">
              {title}
            </h2>
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
          <CategoryForm
            initialCategory={initialCategory}
            submitLabel={submitLabel}
            onCancel={onClose}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </Modal>
  );
}
