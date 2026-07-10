import Badge from '../../../components/common/Badge';
import { formatDate } from '../../../utils/format';
import type { WorkspaceTask } from './types';
import '../../../css/Workspace.css';

export default function TaskCard({
  task,
  dragging = false,
  onClick,
}: {
  task: WorkspaceTask;
  dragging?: boolean;
  onClick?: () => void;
}) {
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
        <span className={`wn-task-card__priority wn-task-card__priority--${task.priority}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="wn-task-card__due">Due {formatDate(task.dueDate)}</span>
        )}
        {task.status === 'done' && <Badge variant="success">Complete</Badge>}
      </div>
    </article>
  );
}
