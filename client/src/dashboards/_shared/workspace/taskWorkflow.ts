import type { TaskOrigin, TaskStatus, WorkspaceTask } from './types';

const FREELANCER_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress'],
  in_progress: ['review'],
  review: ['in_progress'],
  done: [],
};

/** Client reviewing freelancer-owned tasks only */
const CLIENT_REVIEW_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: [],
  in_progress: [],
  review: ['done', 'in_progress'],
  done: [],
};

/** Client managing their own checklist tasks */
const CLIENT_OWN_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress', 'done'],
  in_progress: ['todo', 'done'],
  review: ['todo', 'in_progress', 'done'],
  done: ['todo', 'in_progress'],
};

export const getTaskOrigin = (task: WorkspaceTask): TaskOrigin | undefined =>
  task.origin || task.createdByRole;

export const isOwnTask = (
  role: 'client' | 'freelancer' | 'admin',
  task: WorkspaceTask
) => {
  if (role === 'admin') return true;
  const origin = getTaskOrigin(task);
  return Boolean(origin && origin === role);
};

export const canEditTaskContent = (
  role: 'client' | 'freelancer' | 'admin',
  task: WorkspaceTask,
  readOnly: boolean
) => {
  if (readOnly) return false;
  if (role === 'admin') return true;
  if (!isOwnTask(role, task)) return false;
  if (role === 'freelancer' && task.status === 'done') return false;
  return true;
};

export const canDeleteTask = (
  role: 'client' | 'freelancer' | 'admin',
  task: WorkspaceTask,
  readOnly: boolean
) => {
  if (readOnly) return false;
  if (role === 'admin') return task.status !== 'done';
  return isOwnTask(role, task) && task.status !== 'done';
};

export const canTransitionTask = (
  role: 'client' | 'freelancer' | 'admin',
  fromStatus: TaskStatus,
  toStatus: TaskStatus,
  task?: WorkspaceTask
) => {
  if (fromStatus === toStatus) return true;
  if (role === 'admin') return true;

  const origin = task ? getTaskOrigin(task) : undefined;

  if (role === 'freelancer') {
    if (task && origin === 'client') return false;
    return FREELANCER_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
  }

  if (role === 'client') {
    if (origin === 'client' || (!origin && !task)) {
      return CLIENT_OWN_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
    }
    if (origin === 'freelancer') {
      return CLIENT_REVIEW_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
    }
    return false;
  }

  return false;
};

export const canDragTask = (
  role: 'client' | 'freelancer' | 'admin',
  task: WorkspaceTask,
  readOnly: boolean
) => {
  if (readOnly) return false;
  if (role === 'admin') return task.status !== 'done';

  const origin = getTaskOrigin(task);
  if (role === 'freelancer') {
    return origin === 'freelancer' && task.status !== 'done';
  }
  if (role === 'client') {
    if (origin === 'client') return task.status !== 'done';
    return origin === 'freelancer' && task.status === 'review';
  }
  return false;
};
