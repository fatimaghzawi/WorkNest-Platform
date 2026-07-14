import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Paperclip } from 'lucide-react';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import AttachmentListItem from './AttachmentListItem';
import type { WorkspaceAttachment } from './types';
import { workspaceApi } from '../../../api/workspace.api';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../context/ConfirmContext';
import '../../../css/Workspace.css';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,application/pdf';
const DELIVERABLES_PAGE_SIZE = 8;

export default function TaskDeliverablesPanel({
  jobId,
  taskId,
  canUpload,
  compact = false,
  onChange,
  onMutated,
}: {
  jobId: string;
  taskId: string;
  canUpload: boolean;
  compact?: boolean;
  onChange?: (count: number) => void;
  onMutated?: () => void;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastRef = useRef(toast);
  const onChangeRef = useRef(onChange);
  const onMutatedRef = useRef(onMutated);
  const lastReportedCount = useRef<number | null>(null);
  const [attachments, setAttachments] = useState<WorkspaceAttachment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  toastRef.current = toast;
  onChangeRef.current = onChange;
  onMutatedRef.current = onMutated;

  const reportCount = (total: number) => {
    if (lastReportedCount.current === total) return;
    lastReportedCount.current = total;
    onChangeRef.current?.(total);
  };

  const loadAttachments = useCallback(async () => {
    if (!jobId || !taskId) return;
    setLoading(true);
    try {
      const response = await workspaceApi.listAttachments(jobId, {
        taskId,
        page,
        limit: DELIVERABLES_PAGE_SIZE,
      });
      const items = response.data.data;
      const total = response.data.meta?.total ?? items.length;
      setAttachments(items);
      setTotalPages(response.data.meta?.totalPages || 1);
      setTotalCount(total);
      reportCount(total);
    } catch (error) {
      toastRef.current.error(getApiErrorMessage(error, 'Failed to load deliverables.'));
      setAttachments([]);
      setTotalCount(0);
      reportCount(0);
    } finally {
      setLoading(false);
    }
  }, [jobId, taskId, page]);

  useEffect(() => {
    setPage(1);
    lastReportedCount.current = null;
  }, [jobId, taskId]);

  useEffect(() => {
    void loadAttachments();
  }, [loadAttachments]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !jobId || !taskId) return;

    setUploading(true);
    try {
      await workspaceApi.uploadAttachment(jobId, file, { taskId });
      toast.success('Deliverable uploaded.');
      await loadAttachments();
      onMutatedRef.current?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload deliverable.'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachment: WorkspaceAttachment) => {
    const approved = await confirm({
      title: 'Remove deliverable',
      message: `Delete "${attachment.fileName}" from this task?`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!approved) return;

    setDeletingId(attachment.id);
    try {
      await workspaceApi.deleteAttachment(jobId, attachment.id);
      toast.success('Deliverable removed.');
      await loadAttachments();
      onMutatedRef.current?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete deliverable.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`wn-task-deliverables${compact ? ' wn-task-deliverables--compact' : ''}`}>
      <div className="wn-task-deliverables__header">
        <span>
          <Paperclip size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
          Deliverables
        </span>
        {canUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              className="wn-sr-only"
              onChange={handleFileChange}
            />
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ImagePlus size={14} />}
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload file
            </Button>
          </>
        )}
      </div>

      {canUpload && (
        <p className="wn-workspace-attachments__hint">
          Attach designs, exports, or PDFs the client should review (JPEG, PNG, WebP, PDF — max 5MB).
        </p>
      )}

      {loading ? (
        <p className="wn-workspace-team__empty">Loading deliverables...</p>
      ) : attachments.length === 0 ? (
        <p className="wn-workspace-team__empty">
          {canUpload
            ? 'No deliverables yet. Upload at least one file or add submission notes before submitting.'
            : 'No deliverables attached to this task.'}
        </p>
      ) : (
        <>
          <ul className="wn-workspace-attachments wn-task-deliverables__list">
            {attachments.map((attachment) => (
              <AttachmentListItem
                key={attachment.id}
                attachment={attachment}
                compact={compact}
                onDelete={canUpload ? handleDelete : undefined}
                deleting={deletingId === attachment.id}
              />
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="wn-workspace-attachments__pagination">
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            </div>
          )}
          {totalCount > 0 && (
            <p className="wn-workspace-attachments__hint" style={{ marginTop: 8, marginBottom: 0 }}>
              {totalCount} deliverable{totalCount === 1 ? '' : 's'} total
            </p>
          )}
        </>
      )}
    </div>
  );
}
