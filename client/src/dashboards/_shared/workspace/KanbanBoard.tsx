import { useState, type DragEvent } from 'react';
import TaskCard from './TaskCard';
import type { TaskStatus, WorkspaceTask } from './types';
import { KANBAN_COLUMNS } from './types';
import '../../../css/Workspace.css';

const dotClass: Record<TaskStatus, string> = {
  todo: 'wn-kanban__column-dot--todo',
  in_progress: 'wn-kanban__column-dot--progress',
  review: 'wn-kanban__column-dot--review',
  done: 'wn-kanban__column-dot--done',
};

export default function KanbanBoard({
  tasks,
  readOnly = false,
  onMoveTask,
  onTaskClick,
  onAddTask,
}: {
  tasks: WorkspaceTask[];
  readOnly?: boolean;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onTaskClick: (task: WorkspaceTask) => void;
  onAddTask: (status: TaskStatus) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (event: DragEvent, taskId: string) => {
    if (readOnly) return;
    event.dataTransfer.setData('text/plain', taskId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDrop = (event: DragEvent, status: TaskStatus) => {
    event.preventDefault();
    if (readOnly) return;
    const taskId = event.dataTransfer.getData('text/plain');
    if (taskId) onMoveTask(taskId, status);
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
                if (readOnly) return;
                event.preventDefault();
                setDragOverColumn(column.id);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(event) => handleDrop(event, column.id)}
            >
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable={!readOnly}
                  onDragStart={(event) => handleDragStart(event, task.id)}
                  onDragEnd={handleDragEnd}
                >
                  <TaskCard
                    task={task}
                    dragging={draggingId === task.id}
                    onClick={() => onTaskClick(task)}
                  />
                </div>
              ))}
            </div>

            {!readOnly && (
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
