import { FormEvent, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../../hooks/useToast';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../../types/category';
import { getApiErrorMessage } from '../../utils/apiError';
import '../../css/DashboardFeatures.css';

interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

const emptyValues: CategoryFormValues = {
  name: '',
  slug: '',
  description: '',
  isActive: true,
};

export default function CategoryForm({
  initialCategory,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialCategory?: Category;
  submitLabel: string;
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const toast = useToast();
  const [values, setValues] = useState<CategoryFormValues>(
    initialCategory
      ? {
          name: initialCategory.name,
          slug: initialCategory.slug,
          description: initialCategory.description || '',
          isActive: initialCategory.isActive,
        }
      : emptyValues
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      isActive: values.isActive,
      ...(values.slug.trim() ? { slug: values.slug.trim() } : {}),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save category.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="wn-dash-form" onSubmit={handleSubmit} noValidate>
      <Input
        label="Name"
        required
        value={values.name}
        onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
      />

      <Input
        label="Slug"
        value={values.slug}
        onChange={(e) => setValues((prev) => ({ ...prev, slug: e.target.value }))}
        helperText="Leave empty to auto-generate from name"
      />

      <Input
        as="textarea"
        label="Description"
        value={values.description}
        onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
        rows={4}
      />

      <label className="wn-dash-field-label">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => setValues((prev) => ({ ...prev, isActive: e.target.checked }))}
          style={{ marginRight: 8 }}
        />
        Active category
      </label>

      <div className="wn-dash-form__actions">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
