import type { TaskStatus } from './types';

const FREELANCER_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress'],
  in_progress: [],
  review: ['in_progress'],
  done: [],
};

const CLIENT_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: [],
  in_progress: [],
  review: ['done', 'in_progress'],
  done: [],
};

export const canTransitionTask = (
  role: 'client' | 'freelancer' | 'admin',
  fromStatus: TaskStatus,
  toStatus: TaskStatus
) => {
  if (fromStatus === toStatus) return true;
  if (role === 'admin') return true;
  if (role === 'freelancer') return FREELANCER_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
  if (role === 'client') return CLIENT_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
  return false;
};

export const getAllowedTargetColumns = (
  role: 'client' | 'freelancer' | 'admin',
  fromStatus: TaskStatus
): TaskStatus[] => {
  if (role === 'admin') return ['todo', 'in_progress', 'review', 'done'];
  if (role === 'freelancer') return FREELANCER_TRANSITIONS[fromStatus] ?? [];
  if (role === 'client') return CLIENT_TRANSITIONS[fromStatus] ?? [];
  return [];
};
