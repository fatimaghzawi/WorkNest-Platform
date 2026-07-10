import { useCallback, useEffect, useState } from 'react';
import { FolderKanban } from 'lucide-react';
import {
  projectsApi,
  type Project,
  type ProjectStatus,
} from '../../../api/projects.api';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import ProjectsOverview, { type ProjectPipelineStats } from '../components/projects/ProjectsOverview';
import ProjectQueue from '../components/projects/ProjectQueue';
import ProjectDetailPanel from '../components/projects/ProjectDetailPanel';
import '../../../css/DesignSystem.css';
import '../../../css/AdminAnalytics.css';
import '../../../css/DashboardFeatures.css';
import '../../../css/ProjectsAdmin.css';

type StatusFilter = ProjectStatus | 'all';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All projects' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const emptyStats: ProjectPipelineStats = {
  total: 0,
  active: 0,
  completed: 0,
  cancelled: 0,
};

export default function AdminProjects() {
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectPipelineStats>(emptyStats);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const response = await projectsApi.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast.warning(getApiErrorMessage(error, 'Could not refresh project overview stats.'));
    }
  }, [toast]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await projectsApi.list({
        page,
        limit: 12,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setProjects(response.data.data);
      setTotalPages(response.data.meta?.totalPages || 1);

      setSelectedProject((current) => {
        if (!current) return null;
        const next = response.data.data.find((p) => p._id === current._id);
        return next ?? response.data.data[0] ?? null;
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load projects.'));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, toast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!loading && projects.length > 0) {
      setSelectedProject((current) => {
        if (current && projects.some((p) => p._id === current._id)) return current;
        return projects[0];
      });
    } else if (!loading && projects.length === 0) {
      setSelectedProject(null);
    }
  }, [loading, projects]);

  const handleStageClick = (status: ProjectStatus) => {
    setStatusFilter((current) => (current === status ? 'all' : status));
    setPage(1);
  };

  const hasFilters = statusFilter !== 'all';

  if (loading && projects.length === 0) {
    return (
      <div className="wn-analytics">
        <DashboardPageHeader
          hero
          eyebrow="Admin"
          title="Active engagements"
          subtitle="Loading projects..."
        />
        <div className="wn-projects-overview wn-projects-overview--loading" aria-hidden>
          <div className="wn-projects-overview__spotlight" />
          <div className="wn-projects-overview__tiles">
            <div className="wn-projects-overview__tile" />
            <div className="wn-projects-overview__tile" />
            <div className="wn-projects-overview__tile" />
            <div className="wn-projects-overview__tile" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wn-analytics">
      <DashboardPageHeader
        hero
        eyebrow="Admin"
        title="Active engagements"
        subtitle="Projects are created when a client accepts a proposal. Open any workspace to oversee the shared kanban board."
      />

      <ProjectsOverview
        stats={stats}
        activeFilter={statusFilter}
        onStageClick={handleStageClick}
      />

      <section className="wn-analytics-card wn-projects-toolbar">
        <div className="wn-projects-filters">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`wn-projects-chip ${statusFilter === filter.value ? 'wn-projects-chip--active' : ''}`}
              onClick={() => { setStatusFilter(filter.value); setPage(1); }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <div className="wn-analytics__layout wn-projects-studio">
        <section className="wn-analytics-card wn-projects-queue-wrap">
          {loading ? (
            <div className="wn-projects-queue-skeleton" aria-hidden>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title={hasFilters ? 'No projects match your filters' : 'No projects yet'}
              description={
                hasFilters
                  ? 'Try another status filter.'
                  : 'Accepting a proposal creates a project and unlocks the workspace for that job.'
              }
              actionLabel={hasFilters ? undefined : 'View proposals'}
              actionTo={hasFilters ? undefined : '/admin/proposals'}
            />
          ) : (
            <>
              <ProjectQueue
                projects={projects}
                selectedId={selectedProject?._id}
                onSelect={setSelectedProject}
              />
              {totalPages > 1 && (
                <div className="wn-projects-pagination">
                  <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </section>

        {selectedProject ? (
          <ProjectDetailPanel project={selectedProject} />
        ) : (
          !loading &&
          projects.length > 0 && (
            <section className="wn-analytics-card wn-project-detail wn-project-detail--empty">
              <p>Select a project from the queue to inspect it.</p>
            </section>
          )
        )}
      </div>
    </div>
  );
}
