import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, MessageSquareText } from 'lucide-react';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { workspaceApi } from '../../../api/workspace.api';
import type { TaskDeliverableGroup, WorkspaceAttachment, WorkspaceTask } from './types';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import { formatDateTime } from '../../../utils/format';
import AttachmentListItem from './AttachmentListItem';
import '../../../css/Workspace.css';

const GROUPS_PAGE_SIZE = 8;
const EXPANDED_FILES_PAGE_SIZE = 12;

const statusBadgeVariant = (status: WorkspaceTask['status']) => {
  if (status === 'done') return 'success' as const;
  if (status === 'review') return 'warning' as const;
  if (status === 'in_progress') return 'info' as const;
  return 'neutral' as const;
};

const statusLabel = (status: WorkspaceTask['status']) =>
  status.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());

type ExpandedState = {
  attachments: WorkspaceAttachment[];
  page: number;
  totalPages: number;
  loading: boolean;
};

export default function WorkspaceTaskDeliverablesLibrary({
  jobId,
  refreshKey = 0,
  onOpenTask,
}: {
  jobId: string;
  refreshKey?: number;
  onOpenTask?: (task: TaskDeliverableGroup['task']) => void;
}) {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [groups, setGroups] = useState<TaskDeliverableGroup[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttachments, setTotalAttachments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, ExpandedState>>({});

  const loadGroups = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const response = await workspaceApi.listTaskDeliverables(jobId, {
        page,
        limit: GROUPS_PAGE_SIZE,
        previewLimit: 6,
      });
      setGroups(response.data.data ?? []);
      setTotalPages(response.data.meta?.totalPages || 1);
      setTotalAttachments(response.data.meta?.totalAttachments ?? 0);
    } catch (error) {
      toastRef.current.error(getApiErrorMessage(error, 'Failed to load task deliverables.'));
      setGroups([]);
      setTotalAttachments(0);
    } finally {
      setLoading(false);
    }
  }, [jobId, page]);

  useEffect(() => {
    setPage(1);
    setExpandedTaskId(null);
    setExpanded({});
  }, [jobId, refreshKey]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups, refreshKey]);

  const loadExpandedFiles = useCallback(async (taskId: string, nextPage = 1) => {
    setExpanded((current) => ({
      ...current,
      [taskId]: {
        attachments: current[taskId]?.attachments ?? [],
        page: nextPage,
        totalPages: current[taskId]?.totalPages ?? 1,
        loading: true,
      },
    }));

    try {
      const response = await workspaceApi.listAttachments(jobId, {
        taskId,
        page: nextPage,
        limit: EXPANDED_FILES_PAGE_SIZE,
      });
      setExpanded((current) => ({
        ...current,
        [taskId]: {
          attachments: response.data.data,
          page: nextPage,
          totalPages: response.data.meta?.totalPages || 1,
          loading: false,
        },
      }));
    } catch (error) {
      toastRef.current.error(getApiErrorMessage(error, 'Failed to load task files.'));
      setExpanded((current) => ({
        ...current,
        [taskId]: {
          ...(current[taskId] ?? { attachments: [], page: 1, totalPages: 1 }),
          loading: false,
        },
      }));
    }
  }, [jobId]);

  const toggleGroup = (group: TaskDeliverableGroup) => {
    const taskId = group.task.id;
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
      return;
    }

    setExpandedTaskId(taskId);
    if (group.attachmentTotal > group.attachments.length && !expanded[taskId]) {
      void loadExpandedFiles(taskId, 1);
    }
  };

  if (loading) {
    return <p className="wn-workspace-team__empty">Loading task deliverables...</p>;
  }

  if (groups.length === 0) {
    return (
      <p className="wn-workspace-team__empty">
        No task deliverables yet. Freelancers attach files when working on tasks or submitting for
        review.
      </p>
    );
  }

  return (
    <div className="wn-deliverables-library">
      <p className="wn-workspace-attachments__hint">
        {totalAttachments} file{totalAttachments === 1 ? '' : 's'} linked to tasks — grouped by
        task for easy review.
      </p>

      <ul className="wn-deliverables-library__groups">
        {groups.map((group) => {
          const isOpen = expandedTaskId === group.task.id;
          const expandedState = expanded[group.task.id];
          const previewAttachments = group.attachments;
          const showExpandedList = isOpen && expandedState && !expandedState.loading;
          const attachmentsToShow =
            showExpandedList && expandedState.attachments.length > 0
              ? expandedState.attachments
              : previewAttachments;

          return (
            <li key={group.task.id} className="wn-deliverables-library__group">
              <button
                type="button"
                className="wn-deliverables-library__group-toggle"
                aria-expanded={isOpen}
                onClick={() => toggleGroup(group)}
              >
                <span className="wn-deliverables-library__group-icon">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                <span className="wn-deliverables-library__group-main">
                  <span className="wn-deliverables-library__group-title">{group.task.title}</span>
                  <span className="wn-deliverables-library__group-meta">
                    <Badge variant={statusBadgeVariant(group.task.status)}>
                      {statusLabel(group.task.status)}
                    </Badge>
                    <span>
                      {group.attachmentTotal} file{group.attachmentTotal === 1 ? '' : 's'}
                    </span>
                    {group.task.submittedAt && (
                      <span>Submitted {formatDateTime(group.task.submittedAt)}</span>
                    )}
                  </span>
                </span>
              </button>

              {isOpen && (
                <div className="wn-deliverables-library__group-body">
                  {group.task.submissionNotes && (
                    <div className="wn-task-submission-notes wn-deliverables-library__notes">
                      <strong>
                        <MessageSquareText
                          size={14}
                          style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }}
                        />
                        Submission notes
                      </strong>
                      <p>{group.task.submissionNotes}</p>
                    </div>
                  )}

                  {expandedState?.loading ? (
                    <p className="wn-workspace-team__empty">Loading files...</p>
                  ) : attachmentsToShow.length === 0 ? (
                    <p className="wn-workspace-team__empty">No files for this task.</p>
                  ) : (
                    <ul className="wn-workspace-attachments wn-deliverables-library__files">
                      {attachmentsToShow.map((attachment) => (
                        <AttachmentListItem key={attachment.id} attachment={attachment} compact />
                      ))}
                    </ul>
                  )}

                  {isOpen &&
                    expandedState &&
                    !expandedState.loading &&
                    expandedState.totalPages > 1 && (
                      <div className="wn-deliverables-library__pagination">
                        <Pagination
                          totalPages={expandedState.totalPages}
                          currentPage={expandedState.page}
                          onPageChange={(nextPage) => void loadExpandedFiles(group.task.id, nextPage)}
                        />
                      </div>
                    )}

                  {group.attachmentTotal > previewAttachments.length && !expandedState && isOpen && (
                    <p className="wn-workspace-team__empty">Loading all files...</p>
                  )}

                  <div className="wn-deliverables-library__actions">
                    {onOpenTask && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<FolderOpen size={14} />}
                        onClick={() => onOpenTask(group.task)}
                      >
                        Open task
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {totalPages > 1 && (
        <div className="wn-deliverables-library__pagination">
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
