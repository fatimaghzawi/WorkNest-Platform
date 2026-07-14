import { useState, type DragEvent } from 'react';
import TaskCard from './TaskCard';
import type { TaskStatus, WorkspacePermissions, WorkspaceTask } from './types';
import { KANBAN_COLUMNS } from './types';
import { canDragTask, canTransitionTask } from './taskWorkflow';
import '../../../css/Workspace.css';

const dotClass: Record<TaskStatus, string> = {
  todo: 'wn-kanban__column-dot--todo',
  in_progress: 'wn-kanban__column-dot--progress',
  review: 'wn-kanban__column-dot--review',
  done: 'wn-kanban__column-dot--done',
};

export default function KanbanBoard({
  tasks,
  role,
  permissions,
  readOnly = false,
  onMoveTask,
  onTaskClick,
  onAddTask,
  onTaskAction,
  onSubmitForReview,
}: {
  tasks: WorkspaceTask[];
  role: 'client' | 'freelancer' | 'admin';
  permissions: WorkspacePermissions;
  readOnly?: boolean;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onTaskClick: (task: WorkspaceTask) => void;
  onAddTask: (status: TaskStatus) => void;
  onTaskAction?: (taskId: string, status: TaskStatus) => void;
  onSubmitForReview?: (task: WorkspaceTask) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (event: DragEvent, task: WorkspaceTask) => {
    if (!canDragTask(role, task, readOnly)) return;
    event.dataTransfer.setData('text/plain', task.id);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(task.id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDrop = (event: DragEvent, status: TaskStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    const task = tasks.find((item) => item.id === taskId);
    if (!task || !canDragTask(role, task, readOnly)) return;
    if (!canTransitionTask(role, task.status, status, task)) return;
    onMoveTask(taskId, status);
    setDraggingId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="wn-kanban" role="list" aria-label="Project kanban board">
      {KANBAN_COLUMNS.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.id);
        return (
          <section key={column.id} className="wn-kanban__column" aria-label={column.title}>
            <header className="wn-kanban__column-header">
              <span className="wn-kanban__column-title">
                <span className={`wn-kanban__column-dot ${dotClass[column.id]}`} />
                {column.title}
              </span>
              <span className="wn-kanban__column-count">{columnTasks.length}</span>
            </header>

            <div
              className={`wn-kanban__column-body ${
                dragOverColumn === column.id ? 'wn-kanban__column-body--drag-over' : ''
              }`.trim()}
              onDragOver={(event) => {
                event.preventDefault();
                if (readOnly || !draggingId) return;
                const task = tasks.find((item) => item.id === draggingId);
                if (!task || !canTransitionTask(role, task.status, column.id, task)) return;
                setDragOverColumn(column.id);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(event) => handleDrop(event, column.id)}
            >
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable={canDragTask(role, task, readOnly)}
                  onDragStart={(event) => handleDragStart(event, task)}
                  onDragEnd={handleDragEnd}
                >
                  <TaskCard
                    task={task}
                    dragging={draggingId === task.id}
                    role={role}
                    canManageTasks={permissions.canManageTasks}
                    canReviewTasks={permissions.canReviewTasks}
                    onClick={() => onTaskClick(task)}
                    onTaskAction={onTaskAction}
                    onSubmitForReview={onSubmitForReview}
                  />
                </div>
              ))}
            </div>

            {permissions.canCreate && column.id === 'todo' && !readOnly && (
              <button
                type="button"
                className="wn-workspace__add-task"
                onClick={() => onAddTask(column.id)}
              >
                + Add task
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}
