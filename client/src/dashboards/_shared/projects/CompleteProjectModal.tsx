import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

export default function CompleteProjectModal({
  open,
  projectTitle,
  loading,
  canSubmit = true,
  taskProgressLabel,
  onClose,
  onSubmit,
}: {
  open: boolean;
  projectTitle: string;
  loading?: boolean;
  canSubmit?: boolean;
  taskProgressLabel?: string;
  onClose: () => void;
  onSubmit: (deliveryNotes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState('');

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  const handleSubmit = async () => {
    await onSubmit(notes.trim());
    setNotes('');
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Complete project"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button loading={loading} disabled={!canSubmit} onClick={handleSubmit}>
            Submit for client review
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Mark <strong>{projectTitle}</strong> as finished. Your client will be able to accept the
          delivery or request revisions.
        </p>
        {!canSubmit && taskProgressLabel && (
          <p className="wn-project-status-hint wn-project-status-hint--revision">
            {taskProgressLabel}
          </p>
        )}
        <Input
          as="textarea"
          label="Delivery notes (optional)"
          rows={4}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Summarize what you delivered, links, or handoff details..."
          helperText={`${notes.length}/2000 characters`}
        />
      </div>
    </Modal>
  );
}
