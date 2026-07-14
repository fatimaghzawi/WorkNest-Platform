import { ExternalLink, FileText, Trash2 } from 'lucide-react';
import type { WorkspaceAttachment } from './types';
import { formatDateTime } from '../../../utils/format';
import { resolveMediaUrl } from '../../../utils/mediaUrl';

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(mimeType: string) {
  return mimeType.startsWith('image/');
}

export default function AttachmentListItem({
  attachment,
  compact = false,
  onDelete,
  deleting = false,
}: {
  attachment: WorkspaceAttachment;
  compact?: boolean;
  onDelete?: (attachment: WorkspaceAttachment) => void;
  deleting?: boolean;
}) {
  const isImage = isImageAttachment(attachment.mimeType);
  const mediaUrl = resolveMediaUrl(attachment.fileUrl);

  return (
    <li className={`wn-workspace-attachments__item${compact ? ' wn-workspace-attachments__item--compact' : ''}`}>
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
            <FileText size={compact ? 20 : 24} />
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

      {onDelete && (
        <button
          type="button"
          className="wn-workspace-attachments__delete"
          aria-label={`Delete ${attachment.fileName}`}
          disabled={deleting}
          onClick={() => onDelete(attachment)}
        >
          <Trash2 size={14} />
        </button>
      )}
    </li>
  );
}
