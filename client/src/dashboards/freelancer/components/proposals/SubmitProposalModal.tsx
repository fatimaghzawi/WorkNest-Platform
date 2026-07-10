import { useEffect, useState, type FormEvent } from 'react';
import { Briefcase, CalendarDays, DollarSign, Clock3, Send } from 'lucide-react';
import { proposalsApi } from '../../../../api/proposals.api';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Input';
import Modal from '../../../../components/common/Modal';
import type { Job } from '../../../../types/job';
import { formatCurrency, formatDate, getDeadlineUrgency } from '../../../../utils/format';
import { getApiErrorMessage } from '../../../../utils/apiError';
import { useToast } from '../../../../hooks/useToast';
import '../../../../css/DesignSystem.css';
import '../../../../css/Proposal.css';

interface SubmitProposalModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

const emptyForm = {
  coverLetter: '',
  price: '',
  timeline: '',
};

const MAX_COVER_LENGTH = 3000;

export default function SubmitProposalModal({
  job,
  open,
  onClose,
  onSubmitted,
}: SubmitProposalModalProps) {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!job) return;

    const price = Number(form.price);
    if (!form.coverLetter.trim() || !form.timeline.trim() || !price || price < 1) {
      toast.error('Please fill in cover letter, price, and timeline.');
      return;
    }

    if (form.coverLetter.trim().length > MAX_COVER_LENGTH) {
      toast.error(`Cover letter cannot exceed ${MAX_COVER_LENGTH} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      await proposalsApi.create({
        jobId: job._id,
        coverLetter: form.coverLetter.trim(),
        price,
        timeline: form.timeline.trim(),
      });
      toast.success('Proposal submitted successfully.');
      onSubmitted?.();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit proposal.'));
    } finally {
      setSubmitting(false);
    }
  };

  const urgency = job ? getDeadlineUrgency(job.deadline) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Submit proposal"
      size="lg"
      footer={
        <div className="submit-proposal-modal__footer">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="submit-proposal-form"
            variant="primary"
            loading={submitting}
            loadingText="Submitting..."
            leftIcon={<Send size={16} />}
            disabled={!job}
          >
            Submit proposal
          </Button>
        </div>
      }
    >
      <div className="submit-proposal-modal">
        {job && (
          <section className="submit-proposal-modal__job">
            <div className="submit-proposal-modal__job-header">
              <div className="submit-proposal-modal__job-icon" aria-hidden="true">
                <Briefcase size={22} />
              </div>
              <div className="submit-proposal-modal__job-heading">
                <p className="submit-proposal-modal__eyebrow">Applying to</p>
                <h3 className="submit-proposal-modal__job-title">{job.title}</h3>
              </div>
            </div>

            <div className="submit-proposal-modal__job-body">
              <div className="submit-proposal-modal__job-meta">
                <span>
                  <DollarSign size={14} />
                  Client budget {formatCurrency(job.budget)}
                </span>
                <span>
                  <CalendarDays size={14} />
                  Due {formatDate(job.deadline)}
                </span>
                {urgency && (
                  <span className={`submit-proposal-modal__urgency submit-proposal-modal__urgency--${urgency.level}`}>
                    <Clock3 size={14} />
                    {urgency.label}
                  </span>
                )}
              </div>

              {job.skills.length > 0 && (
                <div className="submit-proposal-modal__skills">
                  {job.skills.slice(0, 5).map((skill) => (
                    <span key={skill} className="wn-dash-skill">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <form id="submit-proposal-form" className="submit-proposal-modal__form" onSubmit={handleSubmit}>
          <Input
            as="textarea"
            label="Cover letter"
            required
            value={form.coverLetter}
            onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
            placeholder="Introduce yourself, explain your approach, and highlight relevant experience for this project..."
            rows={7}
            maxLength={MAX_COVER_LENGTH}
            helperText={`${form.coverLetter.length}/${MAX_COVER_LENGTH} characters`}
          />

          <div className="submit-proposal-modal__row">
            <Input
              type="number"
              label="Your price (USD)"
              required
              min={1}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="500"
              leftIcon={<DollarSign size={16} />}
              helperText={job ? `Client posted ${formatCurrency(job.budget)}` : undefined}
            />

            <Input
              label="Delivery timeline"
              required
              value={form.timeline}
              onChange={(e) => setForm({ ...form, timeline: e.target.value })}
              placeholder="e.g. 2 weeks"
              leftIcon={<Clock3 size={16} />}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}
