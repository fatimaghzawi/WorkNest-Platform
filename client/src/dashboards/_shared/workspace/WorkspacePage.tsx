import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { jobsApi } from '../../../api/jobs.api';
import { projectsApi, type ProjectStatus } from '../../../api/projects.api';
import { workspaceApi } from '../../../api/workspace.api';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import { StatGridSkeleton } from '../../../components/common/Skeleton';
import DashboardPageHeader from '../DashboardPageHeader';
import EmptyState from '../EmptyState';
import KanbanBoard from './KanbanBoard';
import TaskModal from './TaskModal';
import WorkspaceTeamPanel from './WorkspaceTeamPanel';
import WorkspaceAttachmentsPanel from './WorkspaceAttachmentsPanel';
import type { TaskStatus, WorkspaceTask, WorkspaceTeam } from './types';
import { formatCurrency, formatDate } from '../../../utils/format';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../context/ConfirmContext';
import { useAuth } from '../../../hooks/useAuth';
import type { Job } from '../../../types/job';
import { projectStatusLabel } from '../projects/projectStatus';
import '../../../css/Workspace.css';
import '../../../css/DesignSystem.css';

type WorkspaceProject = Job & { projectStatus: ProjectStatus; progress?: number };

const TASKS_PAGE_SIZE = 30;
const PROJECTS_PAGE_SIZE = 20;

export default function WorkspacePage({
  role,
}: {
  role: 'client' | 'freelancer' | 'admin';
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const jobIdFromQuery = searchParams.get('jobId') || '';
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [selectedId, setSelectedId] = useState(jobIdFromQuery);
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksTotalPages, setTasksTotalPages] = useState(1);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsTotalPages, setProjectsTotalPages] = useState(1);
  const [team, setTeam] = useState<WorkspaceTeam | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(role === 'client');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkspaceTask | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedId) ?? null,
    [projects, selectedId]
  );

  const isReadOnly = readOnly || role === 'client';
  const canUploadAttachments = !isReadOnly && (role === 'freelancer' || role === 'admin');

  const pickSelection = (nextProjects: WorkspaceProject[], current: string) => {
    const allowed = new Set(nextProjects.map((project) => project._id));
    if (jobIdFromQuery && allowed.has(jobIdFromQuery)) return jobIdFromQuery;
    if (current && allowed.has(current)) return current;
    return nextProjects[0]?._id || '';
  };

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      if (role === 'admin') {
        const response = await jobsApi.list({
          status: 'in_progress',
          page: projectsPage,
          limit: PROJECTS_PAGE_SIZE,
          sort: 'newest',
        });
        const nextProjects = response.data.data.map(
          (job): WorkspaceProject => ({
            ...job,
            projectStatus: 'active',
          })
        );
        setProjects(nextProjects);
        setProjectsTotalPages(response.data.meta?.totalPages || 1);
        setSelectedId((current) => pickSelection(nextProjects, current));
        return;
      }

      if (role === 'client' || role === 'freelancer') {
        const response = await projectsApi.list({ page: projectsPage, limit: PROJECTS_PAGE_SIZE });
        const nextProjects = response.data.data
          .filter((project) => project.status !== 'cancelled')
          .map(
            (project): WorkspaceProject => ({
              _id: project.jobId,
              title: project.jobTitle || project.title,
              description: '',
              category: '',
              budget: project.jobBudget ?? 0,
              skills: [],
              deadline: project.jobDeadline ?? '',
              status: project.jobStatus === 'closed' ? 'closed' : 'in_progress',
              clientId: project.clientId,
              createdAt: project.createdAt ?? '',
              projectStatus: project.status,
              progress: project.progress,
            })
          );
        setProjects(nextProjects);
        setProjectsTotalPages(response.data.meta?.totalPages || 1);
        setSelectedId((current) => pickSelection(nextProjects, current));
        return;
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load active projects.'));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [role, toast, jobIdFromQuery, projectsPage]);

  const loadTasks = useCallback(
    async (jobId: string, page = tasksPage) => {
      setTasksLoading(true);
      try {
        const response = await workspaceApi.listTasks(jobId, { page, limit: TASKS_PAGE_SIZE });
        setTasks(response.data.data);
        setTasksTotalPages(response.data.meta?.totalPages || 1);
        setTasksTotal(response.data.meta?.total ?? response.data.data.length);
        setReadOnly(Boolean(response.data.meta?.readOnly) || role === 'client');
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load workspace tasks.'));
        setTasks([]);
        setTasksTotal(0);
        setReadOnly(role === 'client');
      } finally {
        setTasksLoading(false);
      }
    },
    [toast, role, tasksPage]
  );

  const loadTeam = useCallback(
    async (jobId: string) => {
      setTeamLoading(true);
      try {
        const response = await workspaceApi.getTeam(jobId);
        setTeam(response.data.data);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load project team.'));
        setTeam(null);
      } finally {
        setTeamLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      setTasksPage(1);
      setTeam(null);
      return;
    }
    setTasksPage(1);
  }, [selectedProject?._id]);

  useEffect(() => {
    if (!selectedProject) return;
    loadTasks(selectedProject._id, tasksPage);
    if (tasksPage === 1) {
      loadTeam(selectedProject._id);
    }
  }, [selectedProject, tasksPage, loadTasks, loadTeam]);

  const handleMoveTask = async (taskId: string, status: TaskStatus) => {
    if (!selectedProject || isReadOnly) return;
    const previous = tasks;
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status } : task))
    );

    try {
      await workspaceApi.updateTask(selectedProject._id, taskId, { status });
    } catch (error) {
      setTasks(previous);
      toast.error(getApiErrorMessage(error, 'Failed to move task.'));
    }
  };

  const handleSaveTask = async (payload: Omit<WorkspaceTask, 'id'> & { id?: string }) => {
    if (!selectedProject || isReadOnly) return;

    try {
      if (payload.id) {
        const response = await workspaceApi.updateTask(selectedProject._id, payload.id, {
          title: payload.title,
          description: payload.description,
          status: payload.status,
          priority: payload.priority,
          dueDate: payload.dueDate ?? null,
        });
        setTasks((current) =>
          current.map((task) => (task.id === payload.id ? response.data.data : task))
        );
        toast.success('Task updated.');
      } else {
        const response = await workspaceApi.createTask(selectedProject._id, {
          title: payload.title,
          description: payload.description,
          status: payload.status,
          priority: payload.priority,
          dueDate: payload.dueDate ?? null,
        });
        setTasks((current) => [response.data.data, ...current]);
        toast.success('Task created.');
        if (tasksPage !== 1) {
          setTasksPage(1);
        } else {
          void loadTasks(selectedProject._id, 1);
        }
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save task.'));
      throw error;
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!selectedProject || isReadOnly) return;

    const confirmed = await confirm({
      title: 'Delete task',
      message: 'Remove this task from the workspace? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await workspaceApi.deleteTask(selectedProject._id, id);
      setTasks((current) => current.filter((task) => task.id !== id));
      setTasksTotal((count) => Math.max(0, count - 1));
      toast.success('Task removed.');
      setModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete task.'));
      throw error;
    }
  };

  const pageProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((task) => task.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const progress = selectedProject?.progress ?? pageProgress;

  const readOnlyBannerMessage =
    !isReadOnly || (role === 'client' && selectedProject?.projectStatus === 'active')
      ? null
      : selectedProject?.projectStatus === 'completed'
        ? 'This project has been completed and is read-only.'
        : selectedProject?.projectStatus === 'pending_review'
          ? 'This workspace is locked while the project awaits your review.'
          : 'This workspace is read-only.';

  if (loading) {
    return (
      <div>
        <DashboardPageHeader
          eyebrow="Workspace"
          title="Project workspace"
          subtitle="Loading your active projects..."
        />
        <StatGridSkeleton count={3} />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div>
        <DashboardPageHeader
          hero
          eyebrow="Workspace"
          title="Project workspace"
          subtitle={
            role === 'client'
              ? 'Accept a proposal to open a shared kanban workspace for the engagement.'
              : role === 'admin'
                ? 'In-progress jobs appear here so you can oversee collaboration boards.'
                : 'Accepted proposals on in-progress jobs unlock your shared workspace.'
          }
        />
        <EmptyState
          icon={Calendar}
          title="No active projects yet"
          description={
            role === 'client'
              ? 'Accept a freelancer proposal to unlock the workspace and kanban board.'
              : role === 'admin'
                ? 'When clients move jobs to in progress, you can inspect their boards here.'
                : 'Win a proposal and wait for the client to accept it.'
          }
          actionLabel={
            role === 'client' ? 'View my jobs' : role === 'admin' ? 'View jobs' : 'Browse jobs'
          }
          actionTo={
            role === 'client' ? '/client/jobs' : role === 'admin' ? '/admin/jobs' : '/freelancer/jobs'
          }
        />
      </div>
    );
  }

  return (
    <div className="wn-workspace">
      <DashboardPageHeader
        hero
        eyebrow="Workspace"
        title={selectedProject?.title ?? 'Project workspace'}
        subtitle={
          isReadOnly
            ? role === 'client'
              ? 'Monitor the freelancer’s kanban board.'
              : 'This project is locked — you can view tasks but not make changes.'
            : 'Plan tasks, track progress, and keep deliverables organized in a colorful kanban view.'
        }
      />

      {readOnlyBannerMessage && (
        <div className="wn-project-review-banner">{readOnlyBannerMessage}</div>
      )}

      <div className="wn-workspace__toolbar">
        <label>
          <span className="wn-sr-only">Select project</span>
          <select
            className="wn-workspace__project-select"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
                {project.projectStatus !== 'active'
                  ? ` (${projectStatusLabel(project.projectStatus)})`
                  : ''}
              </option>
            ))}
          </select>
        </label>
        <Badge variant="info">{progress}% complete</Badge>
      </div>

      {projectsTotalPages > 1 && (
        <div style={{ marginBottom: 16 }}>
          <Pagination
            totalPages={projectsTotalPages}
            currentPage={projectsPage}
            onPageChange={setProjectsPage}
          />
        </div>
      )}

      <div className="wn-workspace__summary">
        <div className="wn-workspace__summary-item">
          <p className="wn-workspace__summary-label">Budget</p>
          <p className="wn-workspace__summary-value">
            {selectedProject ? formatCurrency(selectedProject.budget) : '—'}
          </p>
        </div>
        <div className="wn-workspace__summary-item">
          <p className="wn-workspace__summary-label">Deadline</p>
          <p className="wn-workspace__summary-value">
            {selectedProject?.deadline ? formatDate(selectedProject.deadline) : 'Not set'}
          </p>
        </div>
        <div className="wn-workspace__summary-item">
          <p className="wn-workspace__summary-label">Tasks</p>
          <p className="wn-workspace__summary-value">{tasksTotal}</p>
        </div>
        <div className="wn-workspace__summary-item">
          <p className="wn-workspace__summary-label">Status</p>
          <p className="wn-workspace__summary-value">
            {selectedProject
              ? projectStatusLabel(selectedProject.projectStatus)
              : '—'}
          </p>
        </div>
      </div>

      <div className="wn-workspace__layout">
        <div className="wn-workspace__board-wrap">
          {tasksLoading ? (
            <StatGridSkeleton count={4} />
          ) : (
            <KanbanBoard
              tasks={tasks}
              readOnly={isReadOnly}
              onMoveTask={handleMoveTask}
              onTaskClick={(task) => {
                setEditingTask(task);
                setModalOpen(true);
              }}
              onAddTask={(status) => {
                if (isReadOnly) return;
                setEditingTask(null);
                setDefaultStatus(status);
                setModalOpen(true);
              }}
            />
          )}

          {tasksTotalPages > 1 && !tasksLoading && (
            <div className="wn-workspace__tasks-pagination">
              <Pagination
                totalPages={tasksTotalPages}
                currentPage={tasksPage}
                onPageChange={setTasksPage}
              />
            </div>
          )}
        </div>

        <aside className="wn-workspace__sidebar">
          <WorkspaceTeamPanel
            team={team}
            loading={teamLoading}
            role={role}
            currentUserId={user?._id}
          />

          {selectedProject && (
            <WorkspaceAttachmentsPanel
              jobId={selectedProject._id}
              canUpload={canUploadAttachments}
            />
          )}

          <div className="wn-workspace-panel">
            <div className="wn-workspace-panel__header">Activity</div>
            <div className="wn-workspace-panel__body">
              {tasks.slice(0, 4).map((task) => (
                <p key={task.id} style={{ margin: '0 0 8px' }}>
                  <strong>{task.title}</strong> — {task.status.replace('_', ' ')}
                </p>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        readOnly={isReadOnly}
        defaultStatus={defaultStatus}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={editingTask && !isReadOnly ? handleDeleteTask : undefined}
      />
    </div>
  );
}
