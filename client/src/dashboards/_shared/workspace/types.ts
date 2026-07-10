export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface WorkspaceTask {
  id: string;
  _id?: string;
  jobId?: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const KANBAN_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To do' },
  { id: 'in_progress', title: 'In progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export const createTaskId = () => `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const seedTasksForProject = (projectTitle: string): WorkspaceTask[] => [
  {
    id: createTaskId(),
    title: `Kickoff: ${projectTitle}`,
    status: 'done',
    priority: 'medium',
    dueDate: new Date().toISOString(),
  },
  {
    id: createTaskId(),
    title: 'Define milestones & deliverables',
    status: 'in_progress',
    priority: 'high',
  },
  {
    id: createTaskId(),
    title: 'Share assets & references',
    status: 'todo',
    priority: 'low',
  },
  {
    id: createTaskId(),
    title: 'Client review checkpoint',
    status: 'review',
    priority: 'medium',
  },
];

export type WorkspaceTeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  role: 'client' | 'freelancer';
  profileImage?: string;
};

export type WorkspaceTeam = {
  client: WorkspaceTeamMember | null;
  freelancer: WorkspaceTeamMember | null;
};

export type WorkspaceAttachment = {
  id: string;
  _id?: string;
  jobId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  caption?: string;
  uploadedBy: string;
  uploaderName: string;
  createdAt?: string;
};
