import type { TaskPriority, TaskOrigin } from './types';

export type TaskSortBy = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type TaskSortOrder = 'asc' | 'desc';

export type TaskBoardFilters = {
  origin: TaskOrigin | 'all';
  priority: TaskPriority | 'all';
  sortBy: TaskSortBy;
  sortOrder: TaskSortOrder;
};

export const DEFAULT_TASK_FILTERS: TaskBoardFilters = {
  origin: 'all',
  priority: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

type Props = {
  filters: TaskBoardFilters;
  onChange: (next: TaskBoardFilters) => void;
  disabled?: boolean;
};

export default function TaskBoardFilters({ filters, onChange, disabled = false }: Props) {
  const patch = (partial: Partial<TaskBoardFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="wn-task-filters" aria-label="Task filters">
      <label className="wn-task-filters__field">
        <span>Show</span>
        <select
          value={filters.origin}
          disabled={disabled}
          onChange={(e) => patch({ origin: e.target.value as TaskBoardFilters['origin'] })}
        >
          <option value="all">All tasks</option>
          <option value="client">Client tasks</option>
          <option value="freelancer">Freelancer tasks</option>
        </select>
      </label>

      <label className="wn-task-filters__field">
        <span>Priority</span>
        <select
          value={filters.priority}
          disabled={disabled}
          onChange={(e) => patch({ priority: e.target.value as TaskBoardFilters['priority'] })}
        >
          <option value="all">Any</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>

      <label className="wn-task-filters__field">
        <span>Sort by</span>
        <select
          value={filters.sortBy}
          disabled={disabled}
          onChange={(e) => patch({ sortBy: e.target.value as TaskBoardFilters['sortBy'] })}
        >
          <option value="createdAt">Newest</option>
          <option value="dueDate">Deadline</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </label>

      <label className="wn-task-filters__field">
        <span>Order</span>
        <select
          value={filters.sortOrder}
          disabled={disabled}
          onChange={(e) => patch({ sortOrder: e.target.value as TaskBoardFilters['sortOrder'] })}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </label>
    </div>
  );
}
