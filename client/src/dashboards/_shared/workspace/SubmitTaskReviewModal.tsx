import { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import TaskDeliverablesPanel from './TaskDeliverablesPanel';
import type { WorkspaceTask } from './types';

export default function SubmitTaskReviewModal({
  open,
  jobId,
  task,
  loading = false,
  onClose,
  onSubmit,
}: {
  open: boolean;
  jobId: string;
  task: WorkspaceTask | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { submissionNotes: string }) => Promise<void>;
}) {
  const [notes, setNotes] = useState('');
  const [attachmentCount, setAttachmentCount] = useState(task?.attachmentCount ?? 0);

  useEffect(() => {
    if (!open) return;
    setNotes(task?.submissionNotes ?? '');
    setAttachmentCount(task?.attachmentCount ?? 0);
  }, [open, task]);

  const canSubmit = Boolean(notes.trim()) || attachmentCount > 0;

  const handleSubmit = async () => {
    await onSubmit({ submissionNotes: notes.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Submit task for review"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button loading={loading} disabled={!canSubmit} onClick={handleSubmit}>
            Submit for review
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Share what you completed on <strong>{task?.title}</strong>. The client needs submission
          notes and/or at least one deliverable file to approve this task.
        </p>

        <Input
          as="textarea"
          label="Submission notes"
          rows={4}
          maxLength={2000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Describe what you delivered, what to test, or where to look..."
          helperText={`${notes.length}/2000 characters`}
        />

        {task && (
          <TaskDeliverablesPanel
            jobId={jobId}
            taskId={task.id}
            canUpload
            compact
            onChange={setAttachmentCount}
          />
        )}

        {!canSubmit && (
          <p className="wn-project-status-hint wn-project-status-hint--revision">
            Add submission notes or upload at least one deliverable file.
          </p>
        )}
      </div>
    </Modal>
  );
}
