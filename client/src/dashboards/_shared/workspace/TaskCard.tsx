import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import UserAvatar from '../../../components/users/UserAvatar';
import { formatDate } from '../../../utils/format';
import type { TaskStatus, WorkspaceTask } from './types';
import { getTaskOrigin, isOwnTask } from './taskWorkflow';
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
  const origin = getTaskOrigin(task);
  const ownTask = role ? isOwnTask(role, task) : false;
  const avatarRole = (task.createdByRole || origin || 'freelancer') as
    | 'client'
    | 'freelancer'
    | 'admin';
  const firstName = task.createdByFirstName || task.createdByName?.split(' ')[0] || 'User';
  const lastName =
    task.createdByLastName ||
    task.createdByName?.split(' ').slice(1).join(' ') ||
    '';

  const showSubmit =
    canManageTasks &&
    role === 'freelancer' &&
    ownTask &&
    task.status === 'in_progress';

  const showReviewActions =
    canReviewTasks &&
    role === 'client' &&
    origin === 'freelancer' &&
    task.status === 'review';

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
      <div className="wn-task-card__header">
        <h4 className="wn-task-card__title">{task.title}</h4>
        <span
          className="wn-task-card__owner"
          title={task.createdByName || (origin === 'client' ? 'Client task' : 'Freelancer task')}
        >
          <UserAvatar
            firstName={firstName}
            lastName={lastName}
            role={avatarRole}
            image={task.createdByProfileImage}
            size="sm"
          />
        </span>
      </div>

      <div className="wn-task-card__meta">
        <span className={`wn-task-card__priority wn-task-card__priority--${task.priority}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="wn-task-card__due">Due {formatDate(task.dueDate)}</span>
        )}
        {task.status === 'done' && <Badge variant="success">Complete</Badge>}
        {task.status === 'review' && origin === 'freelancer' && (
          <Badge variant="warning">Awaiting review</Badge>
        )}
        {(task.attachmentCount ?? 0) > 0 && (
          <span className="wn-task-card__files">{task.attachmentCount} file(s)</span>
        )}
      </div>

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
