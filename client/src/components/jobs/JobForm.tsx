import { FormEvent, useEffect, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../../hooks/useToast';

import { categoriesApi } from '../../api/categories.api';
import type { Category } from '../../types/category';
import type { CreateJobPayload, Job, UpdateJobPayload } from '../../types/job';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatCurrency, formatDate, getDeadlineUrgency } from '../../utils/format';
import '../../css/DashboardFeatures.css';
import CategoryIcon from './CategoryIcon';

export interface JobFormValues {
  title: string;
  description: string;
  category: string;
  budget: string;
  skills: string;
  deadline: string;
}

const emptyValues: JobFormValues = {
  title: '',
  description: '',
  category: '',
  budget: '',
  skills: '',
  deadline: '',
};

const toFormValues = (job: Job): JobFormValues => ({
  title: job.title,
  description: job.description,
  category: job.category,
  budget: String(job.budget),
  skills: job.skills.join(', '),
  deadline: job.deadline.slice(0, 10),
});

const toPayload = (values: JobFormValues): CreateJobPayload | UpdateJobPayload => ({
  title: values.title.trim(),
  description: values.description.trim(),
  category: values.category,
  budget: Number(values.budget),
  skills: values.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean),
  deadline: new Date(values.deadline).toISOString(),
});

export default function JobForm({
  initialJob,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialJob?: Job;
  submitLabel: string;
  onSubmit: (payload: CreateJobPayload | UpdateJobPayload) => Promise<void>;
  onCancel?: () => void;
}) {
  const toast = useToast();
  const [values, setValues] = useState<JobFormValues>(initialJob ? toFormValues(initialJob) : emptyValues);
  const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

   useEffect(() => {
    categoriesApi
      .list({ isActive: true, limit: 100 })
      .then((res) => setCategories(res.data.data))
      .catch(() => setCategories([]));
  }, []);
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await onSubmit(toPayload(values));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save job.'));
    } finally {
      setLoading(false);
    }
  };

  const previewSkills = values.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
  const previewBudget = Number(values.budget);
  const previewUrgency = values.deadline ? getDeadlineUrgency(values.deadline) : null;

  return (
    <div className="wn-job-form-layout">
      <div className="wn-job-form-card">
        <div className="wn-job-form-card__header">
          <div className="wn-job-form-card__header-icon" aria-hidden="true">
            {initialJob ? '✎' : '+'}
          </div>
          <div>
            <strong>{initialJob ? 'Job details' : 'New job details'}</strong>
            <p className="wn-dash-card-item__meta" style={{ margin: 0 }}>
              {initialJob
                ? 'Update the information below and save your changes.'
                : 'Fill in the fields below to publish your job.'}
            </p>
          </div>
        </div>

        <div className="wn-job-form-card__body">
          <form className="wn-dash-form" onSubmit={handleSubmit} noValidate style={{ maxWidth: 'none' }}>
            <div className="wn-job-form-section">
              <div className="wn-job-form-section__title">Overview</div>
              <Input
                label="Job title"
                required
                value={values.title}
                onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Build a React dashboard"
              />

              <Input
                as="textarea"
                label="Description"
                required
                value={values.description}
                onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project scope, deliverables, and expectations"
                rows={6}
              />
            </div>

            <div className="wn-job-form-section">
              <div className="wn-job-form-section__title">Scope &amp; budget</div>
              <div className="wn-dash-form__row">
                <div>
                  <label htmlFor="job-category" className="wn-dash-field-label">
                    Category <span>*</span>
                  </label>
                  <select
                    id="job-category"
                    className="wn-dash-select"
                    style={{ width: '100%' }}
                    required
                    value={values.category}
                    onChange={(e) => setValues((prev) => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Budget (USD)"
                  type="number"
                  min={1}
                  required
                  value={values.budget}
                  onChange={(e) => setValues((prev) => ({ ...prev, budget: e.target.value }))}
                />
              </div>

              <div className="wn-dash-form__row">
                <Input
                  label="Skills (comma separated)"
                  required
                  value={values.skills}
                  onChange={(e) => setValues((prev) => ({ ...prev, skills: e.target.value }))}
                  placeholder="React, Node.js, MongoDB"
                  helperText="Enter at least one skill"
                />

                <Input
                  label="Deadline"
                  type="date"
                  required
                  value={values.deadline}
                  onChange={(e) => setValues((prev) => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div className="wn-dash-form__actions">
              <Button type="submit" loading={loading}>
                {submitLabel}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="wn-job-preview">
        <div className="wn-job-preview__label">Live preview</div>
        <article className={`wn-job-card wn-job-card--${initialJob?.status ?? 'open'}`}>
          <div className="wn-job-card__top">
            <span className="wn-job-card__category">
              <span className="wn-job-card__category-icon">
                <CategoryIcon />
              </span>
              {values.category || 'Category'}
            </span>
          </div>
          <h3 className="wn-job-card__title">
            {values.title || <span className="wn-job-card--placeholder">Your job title appears here</span>}
          </h3>
          <p className="wn-job-card__desc">
            {values.description || (
              <span className="wn-job-card--placeholder">
                Your description will show up here as you type.
              </span>
            )}
          </p>
          <div className="wn-job-card__meta-row">
            <span className="wn-job-card__budget">
              {previewBudget > 0 ? formatCurrency(previewBudget) : '$—'}
            </span>
            {previewUrgency ? (
              <span className={`wn-urgency-chip wn-urgency-chip--${previewUrgency.level}`}>
                {previewUrgency.label}
              </span>
            ) : (
              <span>No deadline set</span>
            )}
          </div>
          {previewSkills.length > 0 && (
            <div className="wn-job-card__skills">
              {previewSkills.slice(0, 6).map((skill) => (
                <span key={skill} className="wn-dash-skill">
                  {skill}
                </span>
              ))}
            </div>
          )}
          <div className="wn-job-card__footer">
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {values.deadline ? `Due ${formatDate(values.deadline)}` : 'Set a deadline'}
            </span>
          </div>
        </article>
      </div>
    </div>
  );
}