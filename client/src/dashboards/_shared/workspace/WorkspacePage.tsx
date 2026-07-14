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
import CompleteProjectModal from '../projects/CompleteProjectModal';
import RequestReviewModal from '../projects/RequestReviewModal';
import KanbanBoard from './KanbanBoard';
import TaskModal from './TaskModal';
import SubmitTaskReviewModal from './SubmitTaskReviewModal';
import TaskBoardFilters, { DEFAULT_TASK_FILTERS, type TaskBoardFilters as TaskFiltersState } from './TaskBoardFilters';
import WorkspaceProjectActions from './WorkspaceProjectActions';
import WorkspaceTeamPanel from './WorkspaceTeamPanel';
import WorkspaceFilesPanel from './WorkspaceFilesPanel';
import type { TaskStatus, WorkspaceTask, WorkspaceTeam, WorkspacePermissions } from './types';
import { canDeleteTask, canEditTaskContent, isOwnTask } from './taskWorkflow';
import { formatCurrency, formatDate } from '../../../utils/format';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../context/ConfirmContext';
import { useAuth } from '../../../hooks/useAuth';
import type { Job } from '../../../types/job';
import { projectStatusLabel } from '../projects/projectStatus';
import '../../../css/Workspace.css';
import '../../../css/DesignSystem.css';

type WorkspaceProject = Job & { projectStatus: ProjectStatus; progress?: number; projectId: string };

const TASKS_PAGE_SIZE = 30;
const PROJECTS_PAGE_SIZE = 20;

const DEFAULT_PERMISSIONS: WorkspacePermissions = {
  canCreate: false,
  canManageTasks: false,
  canReviewTasks: false,
};

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
  const [taskFilters, setTaskFilters] = useState<TaskFiltersState>(DEFAULT_TASK_FILTERS);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsTotalPages, setProjectsTotalPages] = useState(1);
  const [team, setTeam] = useState<WorkspaceTeam | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [permissions, setPermissions] = useState<WorkspacePermissions>(DEFAULT_PERMISSIONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkspaceTask | null>(null);
  const [submitTaskTarget, setSubmitTaskTarget] = useState<WorkspaceTask | null>(null);
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [progress, setProgress] = useState(0);
  const [projectActing, setProjectActing] = useState(false);
  const [completeProjectOpen, setCompleteProjectOpen] = useState(false);
  const [revisionProjectOpen, setRevisionProjectOpen] = useState(false);
  const [deliverablesRefreshKey, setDeliverablesRefreshKey] = useState(0);

  const bumpDeliverables = useCallback(() => {
    setDeliverablesRefreshKey((current) => current + 1);
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedId) ?? null,
    [projects, selectedId]
  );

  const isFullyReadOnly = readOnly;
  const canUploadAttachments =
    (role === 'freelancer' || role === 'admin') &&
    permissions.canManageTasks &&
    !isFullyReadOnly;

  const applyProjectPatch = useCallback((jobId: string, patch: Partial<WorkspaceProject>) => {
    setProjects((current) => {
      let changed = false;
      const next = current.map((project) => {
        if (project._id !== jobId) return project;
        const updated = { ...project, ...patch };
        const isSame = (Object.keys(patch) as (keyof WorkspaceProject)[]).every(
          (key) => project[key] === updated[key]
        );
        if (isSame) return project;
        changed = true;
        return updated;
      });
      return changed ? next : current;
    });
  }, []);

  const syncProgress = useCallback(
    async (jobId: string) => {
      try {
        const response = await workspaceApi.listTasks(jobId, {
          page: tasksPage,
          limit: TASKS_PAGE_SIZE,
        });
        const nextProgress = response.data.meta?.progress ?? 0;
        setProgress(nextProgress);
        applyProjectPatch(jobId, { progress: nextProgress });
      } catch {
        // keep current progress on sync failure
      }
    },
    [applyProjectPatch, tasksPage]
  );

  const refreshProjectFromApi = useCallback(
    async (projectId: string, jobId: string) => {
      try {
        const response = await projectsApi.getById(projectId);
        const project = response.data.data;
        applyProjectPatch(jobId, {
          projectStatus: project.status,
          progress: project.progress,
        });
        setProgress(project.progress);
        setReadOnly(project.status === 'pending_review' || project.status === 'completed');
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to refresh project status.'));
      }
    },
    [applyProjectPatch, toast]
  );

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
            projectId: job._id,
            projectStatus: 'active',
            progress: 0,
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
              projectId: project.id,
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
        const response = await workspaceApi.listTasks(jobId, {
          page,
          limit: TASKS_PAGE_SIZE,
          origin: taskFilters.origin === 'all' ? undefined : taskFilters.origin,
          priority: taskFilters.priority === 'all' ? undefined : taskFilters.priority,
          sortBy: taskFilters.sortBy,
          sortOrder: taskFilters.sortOrder,
        });
        setTasks(response.data.data);
        setTasksTotalPages(response.data.meta?.totalPages || 1);
        setTasksTotal(response.data.meta?.total ?? response.data.data.length);
        setReadOnly(Boolean(response.data.meta?.readOnly));
        setPermissions(response.data.meta?.permissions ?? DEFAULT_PERMISSIONS);
        setProgress(response.data.meta?.progress ?? 0);
        applyProjectPatch(jobId, { progress: response.data.meta?.progress ?? 0 });
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load workspace tasks.'));
        setTasks([]);
        setTasksTotal(0);
        setReadOnly(true);
        setPermissions(DEFAULT_PERMISSIONS);
      } finally {
        setTasksLoading(false);
      }
    },
    [toast, tasksPage, applyProjectPatch, taskFilters]
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
    if (!selectedId) return;
    const cached = projects.find((project) => project._id === selectedId)?.progress;
    if (cached != null) setProgress(cached);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync cached progress when switching projects
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setTasks([]);
      setTasksPage(1);
      setTeam(null);
      setProgress(0);
      setTaskFilters(DEFAULT_TASK_FILTERS);
      return;
    }
    setTasksPage(1);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    setTasksPage(1);
  }, [selectedId, taskFilters]);

  useEffect(() => {
    if (!selectedId) return;
    void loadTasks(selectedId, tasksPage);
    if (tasksPage === 1) {
      void loadTeam(selectedId);
    }
  }, [selectedId, tasksPage, loadTasks, loadTeam]);

  const handleOpenTaskFromLibrary = useCallback(
    (task: { id: string; title: string; status: TaskStatus; submissionNotes?: string; submittedAt?: string }) => {
      const fromBoard = tasks.find((item) => item.id === task.id);
      setEditingTask(
        fromBoard ?? {
          id: task.id,
          title: task.title,
          status: task.status,
          priority: 'medium',
          submissionNotes: task.submissionNotes,
          submittedAt: task.submittedAt,
        }
      );
      setModalOpen(true);
    },
    [tasks]
  );

  const handleMoveTask = async (taskId: string, status: TaskStatus) => {
    if (!selectedProject || isFullyReadOnly) return;

    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    if (role === 'freelancer' && status === 'review') {
      if (!isOwnTask(role, task)) {
        toast.error('You can only submit your own tasks for review. Client tasks stay on the client side.');
        return;
      }
      if (task.status !== 'in_progress') {
        toast.error('Move the task to In progress first, then submit it for review.');
        return;
      }
      setSubmitTaskTarget(task);
      return;
    }

    if (role === 'freelancer' && !isOwnTask(role, task)) {
      toast.error('You can only update your own tasks.');
      return;
    }

    const previous = tasks;
    setTasks((current) =>
      current.map((item) => (item.id === taskId ? { ...item, status } : item))
    );

    try {
      const response = await workspaceApi.updateTask(selectedProject._id, taskId, { status });
      setTasks((current) =>
        current.map((item) => (item.id === taskId ? response.data.data : item))
      );
      await syncProgress(selectedProject._id);
    } catch (error) {
      setTasks(previous);
      toast.error(getApiErrorMessage(error, 'Failed to move task.'));
    }
  };

  const handleTaskAction = handleMoveTask;

  const handleSubmitTaskForReview = async ({ submissionNotes }: { submissionNotes: string }) => {
    if (!selectedProject || !submitTaskTarget) return;

    setSubmittingTaskId(submitTaskTarget.id);
    try {
      const response = await workspaceApi.updateTask(selectedProject._id, submitTaskTarget.id, {
        status: 'review',
        submissionNotes,
      });
      setTasks((current) =>
        current.map((task) => (task.id === submitTaskTarget.id ? response.data.data : task))
      );
      await syncProgress(selectedProject._id);
      bumpDeliverables();
      toast.success('Task submitted for client review.');
      setSubmitTaskTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit task for review.'));
      throw error;
    } finally {
      setSubmittingTaskId(null);
    }
  };

  const handleCompleteProject = async (deliveryNotes: string) => {
    if (!selectedProject?.projectId) return;

    setProjectActing(true);
    try {
      await projectsApi.submitForReview(selectedProject.projectId, {
        deliveryNotes: deliveryNotes || undefined,
      });
      toast.success('Project submitted for client review.');
      setCompleteProjectOpen(false);
      await refreshProjectFromApi(selectedProject.projectId, selectedProject._id);
      await loadTasks(selectedProject._id, tasksPage);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit project.'));
    } finally {
      setProjectActing(false);
    }
  };

  const handleAcceptDelivery = async () => {
    if (!selectedProject?.projectId) return;

    const approved = await confirm({
      title: 'Accept delivery',
      message: `Mark "${selectedProject.title}" as completed? The workspace will become read-only.`,
      confirmLabel: 'Accept delivery',
    });
    if (!approved) return;

    setProjectActing(true);
    try {
      await projectsApi.accept(selectedProject.projectId);
      toast.success('Project marked as completed.');
      await refreshProjectFromApi(selectedProject.projectId, selectedProject._id);
      await loadTasks(selectedProject._id, tasksPage);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to accept project.'));
    } finally {
      setProjectActing(false);
    }
  };

  const handleRequestRevision = async (reviewNotes: string) => {
    if (!selectedProject?.projectId) return;

    setProjectActing(true);
    try {
      await projectsApi.requestReview(selectedProject.projectId, { reviewNotes });
      toast.success('Revision request sent to the freelancer.');
      setRevisionProjectOpen(false);
      await refreshProjectFromApi(selectedProject.projectId, selectedProject._id);
      await loadTasks(selectedProject._id, tasksPage);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to request revisions.'));
    } finally {
      setProjectActing(false);
    }
  };

  const handleSaveTask = async (payload: Omit<WorkspaceTask, 'id'> & { id?: string }) => {
    if (!selectedProject) return;
    const isCreate = !payload.id;
    if (isCreate && !permissions.canCreate) return;
    if (!isCreate) {
      const existing = tasks.find((task) => task.id === payload.id);
      if (!existing || !canEditTaskContent(role, existing, isFullyReadOnly)) return;
    }

    try {
      if (payload.id) {
        const response = await workspaceApi.updateTask(selectedProject._id, payload.id, {
          title: payload.title,
          description: payload.description,
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
          priority: payload.priority,
          dueDate: payload.dueDate ?? null,
        });
        setTasks((current) => [response.data.data, ...current]);
        setTasksTotal((count) => count + 1);
        toast.success('Task created.');
        await syncProgress(selectedProject._id);
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
    if (!selectedProject) return;
    const existing = tasks.find((task) => task.id === id);
    if (!existing || !canDeleteTask(role, existing, isFullyReadOnly)) return;

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
      await syncProgress(selectedProject._id);
      toast.success('Task removed.');
      setModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete task.'));
      throw error;
    }
  };

  const readOnlyBannerMessage =
    selectedProject?.projectStatus === 'completed'
      ? 'This project has been completed and is read-only.'
      : selectedProject?.projectStatus === 'pending_review'
        ? role === 'client'
          ? 'Review the final delivery below, then accept or request revisions.'
          : 'This workspace is locked while the client reviews your final delivery.'
        : isFullyReadOnly
          ? 'This workspace is read-only.'
          : role === 'client'
            ? 'Add and manage your own tasks. Approve or request changes on freelancer work in review.'
            : null;

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
          isFullyReadOnly
            ? role === 'client'
              ? 'Review project delivery and track completed work.'
              : 'This project is locked — you can view tasks but not make changes.'
            : role === 'client'
              ? 'Add tasks, approve deliverables in In review, and track progress.'
              : 'Move tasks through the board, submit work for review, then complete the project.'
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

      {selectedProject && (role === 'client' || role === 'freelancer') && (
        <WorkspaceProjectActions
          role={role}
          projectStatus={selectedProject.projectStatus}
          progress={progress}
          acting={projectActing}
          onCompleteProject={() => setCompleteProjectOpen(true)}
          onAcceptDelivery={handleAcceptDelivery}
          onRequestRevision={() => setRevisionProjectOpen(true)}
        />
      )}

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
          {selectedId && (
            <TaskBoardFilters
              filters={taskFilters}
              disabled={tasksLoading}
              onChange={(next) => {
                setTaskFilters(next);
              }}
            />
          )}

          {tasksLoading ? (
            <StatGridSkeleton count={4} />
          ) : (
            <KanbanBoard
              tasks={tasks}
              role={role}
              permissions={permissions}
              readOnly={isFullyReadOnly}
              onMoveTask={handleMoveTask}
              onTaskAction={handleTaskAction}
              onSubmitForReview={setSubmitTaskTarget}
              onTaskClick={(task) => {
                setEditingTask(task);
                setModalOpen(true);
              }}
              onAddTask={(status) => {
                if (!permissions.canCreate) return;
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
            <WorkspaceFilesPanel
              jobId={selectedProject._id}
              canUploadProjectFiles={canUploadAttachments}
              deliverablesRefreshKey={deliverablesRefreshKey}
              onOpenTask={handleOpenTaskFromLibrary}
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
        jobId={selectedProject?._id}
        readOnly={
          isFullyReadOnly ||
          Boolean(editingTask && !canEditTaskContent(role, editingTask, isFullyReadOnly))
        }
        canUploadDeliverables={
          permissions.canManageTasks &&
          role === 'freelancer' &&
          Boolean(
            editingTask &&
              isOwnTask(role, editingTask) &&
              (editingTask.status === 'todo' || editingTask.status === 'in_progress')
          )
        }
        canDelete={Boolean(
          editingTask && canDeleteTask(role, editingTask, isFullyReadOnly)
        )}
        defaultStatus={defaultStatus}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={
          editingTask && canDeleteTask(role, editingTask, isFullyReadOnly)
            ? handleDeleteTask
            : undefined
        }
        onDeliverablesChange={bumpDeliverables}
      />

      <SubmitTaskReviewModal
        open={Boolean(submitTaskTarget)}
        jobId={selectedProject?._id || ''}
        task={submitTaskTarget}
        loading={submittingTaskId === submitTaskTarget?.id}
        onClose={() => setSubmitTaskTarget(null)}
        onSubmit={handleSubmitTaskForReview}
      />

      <CompleteProjectModal
        open={completeProjectOpen}
        projectTitle={selectedProject?.title || 'Project'}
        loading={projectActing}
        canSubmit={progress >= 100}
        taskProgressLabel={
          progress < 100
            ? `All tasks must be approved before you can submit the project (${progress}% complete).`
            : undefined
        }
        onClose={() => setCompleteProjectOpen(false)}
        onSubmit={handleCompleteProject}
      />

      <RequestReviewModal
        open={revisionProjectOpen}
        projectTitle={selectedProject?.title || 'Project'}
        loading={projectActing}
        onClose={() => setRevisionProjectOpen(false)}
        onSubmit={handleRequestRevision}
      />
    </div>
  );
}
