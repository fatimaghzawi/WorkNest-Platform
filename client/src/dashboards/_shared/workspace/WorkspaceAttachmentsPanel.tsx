import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Paperclip } from 'lucide-react';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { workspaceApi } from '../../../api/workspace.api';
import type { WorkspaceAttachment } from './types';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../context/ConfirmContext';
import AttachmentListItem from './AttachmentListItem';
import '../../../css/Workspace.css';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,application/pdf';
const ATTACHMENTS_PAGE_SIZE = 12;

export default function WorkspaceAttachmentsPanel({
  jobId,
  canUpload,
  embedded = false,
}: {
  jobId: string;
  canUpload: boolean;
  embedded?: boolean;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<WorkspaceAttachment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAttachments = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const response = await workspaceApi.listAttachments(jobId, {
        page,
        limit: ATTACHMENTS_PAGE_SIZE,
      });
      setAttachments(response.data.data);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load attachments.'));
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  }, [jobId, page, toast]);

  useEffect(() => {
    setPage(1);
  }, [jobId]);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !jobId) return;

    setUploading(true);
    try {
      await workspaceApi.uploadAttachment(jobId, file);
      toast.success('Attachment uploaded.');
      if (page !== 1) {
        setPage(1);
      } else {
        await loadAttachments();
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload attachment.'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachment: WorkspaceAttachment) => {
    const approved = await confirm({
      title: 'Remove attachment',
      message: `Delete "${attachment.fileName}" from this workspace?`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!approved) return;

    setDeletingId(attachment.id);
    try {
      await workspaceApi.deleteAttachment(jobId, attachment.id);
      toast.success('Attachment removed.');
      if (attachments.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadAttachments();
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete attachment.'));
    } finally {
      setDeletingId(null);
    }
  };

  const content = (
    <>
      {!embedded && (
        <div className="wn-workspace-panel__header wn-workspace-attachments__header">
          <span>
            <Paperclip size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
            Attachments
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
                Upload
              </Button>
            </>
          )}
        </div>
      )}

      {embedded && canUpload && (
        <div className="wn-workspace-attachments__header wn-workspace-attachments__header--embedded">
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
            Upload project file
          </Button>
        </div>
      )}

      <div className={embedded ? undefined : 'wn-workspace-panel__body'}>
        {canUpload && (
          <p className="wn-workspace-attachments__hint">
            Share project-wide files here (briefs, brand assets). Task deliverables live in the
            Task deliverables tab.
          </p>
        )}

        {loading ? (
          <p className="wn-workspace-team__empty">Loading attachments...</p>
        ) : attachments.length === 0 ? (
          <p className="wn-workspace-team__empty">
            {canUpload
              ? 'No project files yet. Upload briefs or brand assets here.'
              : 'No project files shared yet.'}
          </p>
        ) : (
          <>
            <ul className="wn-workspace-attachments">
              {attachments.map((attachment) => (
                <AttachmentListItem
                  key={attachment.id}
                  attachment={attachment}
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
          </>
        )}
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return <div className="wn-workspace-panel">{content}</div>;
}
