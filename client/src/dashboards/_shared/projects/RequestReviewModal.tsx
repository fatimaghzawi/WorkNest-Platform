import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

export default function RequestReviewModal({
  open,
  projectTitle,
  deliveryNotes,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  projectTitle: string;
  deliveryNotes?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reviewNotes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState('');

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  const handleSubmit = async () => {
    if (notes.trim().length < 10) return;
    await onSubmit(notes.trim());
    setNotes('');
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Request revisions"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="outline"
            loading={loading}
            disabled={notes.trim().length < 10}
            onClick={handleSubmit}
          >
            Send revision request
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Tell <strong>{projectTitle}</strong> what still needs to be changed. The project will
          return to active status in the workspace.
        </p>
        {deliveryNotes && (
          <div className="wn-project-review-notes">
            <p className="wn-project-review-notes__label">Freelancer delivery notes</p>
            <p className="wn-project-review-notes__body">{deliveryNotes}</p>
          </div>
        )}
        <Input
          as="textarea"
          label="Revision feedback"
          rows={4}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what should be revised before you can accept..."
          helperText={`${notes.length}/2000 · minimum 10 characters`}
          required
        />
      </div>
    </Modal>
  );
}
