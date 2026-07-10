import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, FileText, ImagePlus, Paperclip, Trash2 } from 'lucide-react';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { workspaceApi } from '../../../api/workspace.api';
import type { WorkspaceAttachment } from './types';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../context/ConfirmContext';
import { formatDateTime } from '../../../utils/format';
import { resolveMediaUrl } from '../../../utils/mediaUrl';
import '../../../css/Workspace.css';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,application/pdf';
const ATTACHMENTS_PAGE_SIZE = 12;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(mimeType: string) {
  return mimeType.startsWith('image/');
}

export default function WorkspaceAttachmentsPanel({
  jobId,
  canUpload,
}: {
  jobId: string;
  canUpload: boolean;
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

  return (
    <div className="wn-workspace-panel">
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

      <div className="wn-workspace-panel__body">
        {canUpload && (
          <p className="wn-workspace-attachments__hint">
            Share screenshots, mockups, or PDFs with your client (JPEG, PNG, WebP, PDF — max 5MB).
          </p>
        )}

        {loading ? (
          <p className="wn-workspace-team__empty">Loading attachments...</p>
        ) : attachments.length === 0 ? (
          <p className="wn-workspace-team__empty">
            {canUpload
              ? 'No attachments yet. Upload work-in-progress screenshots here.'
              : 'No attachments shared yet.'}
          </p>
        ) : (
          <>
            <ul className="wn-workspace-attachments">
              {attachments.map((attachment) => {
                const isImage = isImageAttachment(attachment.mimeType);
                const mediaUrl = resolveMediaUrl(attachment.fileUrl);
                return (
                  <li key={attachment.id} className="wn-workspace-attachments__item">
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="wn-workspace-attachments__preview"
                      aria-label={`Open ${attachment.fileName}`}
                    >
                      {isImage ? (
                        <img src={mediaUrl} alt={attachment.fileName} loading="lazy" />
                      ) : (
                        <span className="wn-workspace-attachments__file-icon">
                          <FileText size={28} />
                        </span>
                      )}
                    </a>

                    <div className="wn-workspace-attachments__meta">
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wn-workspace-attachments__name"
                      >
                        {attachment.caption || attachment.fileName}
                        <ExternalLink size={12} />
                      </a>
                      <span className="wn-workspace-attachments__details">
                        {attachment.uploaderName}
                        <span className="wn-dash-card-divider">•</span>
                        {formatFileSize(attachment.fileSize)}
                        {attachment.createdAt && (
                          <>
                            <span className="wn-dash-card-divider">•</span>
                            {formatDateTime(attachment.createdAt)}
                          </>
                        )}
                      </span>
                    </div>

                    {canUpload && (
                      <button
                        type="button"
                        className="wn-workspace-attachments__delete"
                        aria-label={`Delete ${attachment.fileName}`}
                        disabled={deletingId === attachment.id}
                        onClick={() => handleDelete(attachment)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            {totalPages > 1 && (
              <div className="wn-workspace-attachments__pagination">
                <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
