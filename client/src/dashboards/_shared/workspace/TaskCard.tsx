import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { formatDate } from '../../../utils/format';
import type { TaskStatus, WorkspaceTask } from './types';
import '../../../css/Workspace.css';

export default function TaskCard({
  task,
  dragging = false,
  onClick,
  role,
  canManageTasks = false,
  canReviewTasks = false,
  onTaskAction,
  onSubmitForReview,
}: {
  task: WorkspaceTask;
  dragging?: boolean;
  onClick?: () => void;
  role?: 'client' | 'freelancer' | 'admin';
  canManageTasks?: boolean;
  canReviewTasks?: boolean;
  onTaskAction?: (taskId: string, status: TaskStatus) => void;
  onSubmitForReview?: (task: WorkspaceTask) => void;
}) {
  const showSubmit =
    canManageTasks && role === 'freelancer' && task.status === 'in_progress';
  const showReviewActions = canReviewTasks && role === 'client' && task.status === 'review';

  return (
    <article
      className={`wn-task-card ${dragging ? 'wn-task-card--dragging' : ''}`.trim()}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <h4 className="wn-task-card__title">{task.title}</h4>
      <div className="wn-task-card__meta">
        {(task.origin || task.createdByRole) && (
          <span
            className={`wn-task-card__origin wn-task-card__origin--${task.origin || task.createdByRole}`}
          >
            {(task.origin || task.createdByRole) === 'client' ? 'Client' : 'Freelancer'}
          </span>
        )}
        <span className={`wn-task-card__priority wn-task-card__priority--${task.priority}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="wn-task-card__due">Due {formatDate(task.dueDate)}</span>
        )}
        {task.status === 'done' && <Badge variant="success">Complete</Badge>}
        {task.status === 'review' && <Badge variant="warning">Awaiting review</Badge>}
        {(task.attachmentCount ?? 0) > 0 && (
          <span className="wn-task-card__files">{task.attachmentCount} file(s)</span>
        )}
      </div>
      {task.createdByName && (
        <p className="wn-task-card__creator">Added by {task.createdByName}</p>
      )}

      {(showSubmit || showReviewActions) && (
        <div
          className="wn-task-card__actions"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {showSubmit && (
            <Button
              size="sm"
              variant="secondary"
              fullWidth
              onClick={() => onSubmitForReview?.(task)}
            >
              Submit for review
            </Button>
          )}
          {showReviewActions && (
            <>
              <Button
                size="sm"
                variant="primary"
                fullWidth
                onClick={() => onTaskAction?.(task.id, 'done')}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                fullWidth
                onClick={() => onTaskAction?.(task.id, 'in_progress')}
              >
                Request changes
              </Button>
            </>
          )}
        </div>
      )}
    </article>
  );
}
