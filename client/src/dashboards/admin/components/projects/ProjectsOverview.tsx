import { Briefcase, CircleCheck, CircleX, FolderKanban } from 'lucide-react';
import type { ProjectStatus } from '../../../../api/projects.api';

export interface ProjectPipelineStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
}

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

type StatusFilter = ProjectStatus | 'all';

export default function ProjectsOverview({
  stats,
  activeFilter = 'all',
  onStageClick,
}: {
  stats: ProjectPipelineStats;
  activeFilter?: StatusFilter;
  onStageClick?: (status: ProjectStatus) => void;
}) {
  const live = stats.active;
  const livePct = pct(live, stats.total);
  const mix = [
    { key: 'active', value: stats.active, color: '#15803d' },
    { key: 'completed', value: stats.completed, color: '#6e3482' },
    { key: 'cancelled', value: stats.cancelled, color: '#b91c1c' },
  ].filter((item) => item.value > 0);

  const tileClass = (status: ProjectStatus) =>
    [
      'wn-projects-overview__tile',
      `wn-projects-overview__tile--${status}`,
      activeFilter === status ? 'wn-projects-overview__tile--active' : '',
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <section className="wn-projects-overview" aria-label="Projects overview">
      <div className="wn-projects-overview__spotlight">
        <div className="wn-projects-overview__glow" aria-hidden />
        <div className="wn-projects-overview__rings" aria-hidden>
          <span />
          <span />
        </div>
        <p className="wn-projects-overview__eyebrow">Engagement snapshot</p>
        <p className="wn-projects-overview__total">{stats.total.toLocaleString()}</p>
        <p className="wn-projects-overview__headline">Active projects</p>
        <p className="wn-projects-overview__caption">
          {live} in delivery · {livePct}% currently active
        </p>
        <div className="wn-projects-overview__meter" aria-hidden>
          <span style={{ width: `${Math.max(livePct, 8)}%` }} />
        </div>
        {stats.total > 0 && (
          <div className="wn-projects-overview__mix" aria-label="Project status mix">
            <div className="wn-projects-overview__mix-bar">
              {mix.map((item) => (
                <span
                  key={item.key}
                  style={{ flexGrow: item.value, background: item.color }}
                  title={`${item.key}: ${item.value}`}
                />
              ))}
            </div>
            <div className="wn-projects-overview__mix-legend">
              <span>Active {pct(stats.active, stats.total)}%</span>
              <span>Completed {pct(stats.completed, stats.total)}%</span>
              <span>Cancelled {pct(stats.cancelled, stats.total)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="wn-projects-overview__tiles">
        <button
          type="button"
          className={tileClass('active')}
          onClick={() => onStageClick?.('active')}
          aria-pressed={activeFilter === 'active'}
        >
          <span className="wn-projects-overview__tile-icon">
            <Briefcase size={18} />
          </span>
          <div>
            <p className="wn-projects-overview__tile-value">{stats.active}</p>
            <p className="wn-projects-overview__tile-label">Active</p>
            <p className="wn-projects-overview__tile-hint">In delivery now</p>
          </div>
          <span className="wn-projects-overview__tile-pct">{pct(stats.active, stats.total)}%</span>
        </button>

        <button
          type="button"
          className={tileClass('completed')}
          onClick={() => onStageClick?.('completed')}
          aria-pressed={activeFilter === 'completed'}
        >
          <span className="wn-projects-overview__tile-icon">
            <CircleCheck size={18} />
          </span>
          <div>
            <p className="wn-projects-overview__tile-value">{stats.completed}</p>
            <p className="wn-projects-overview__tile-label">Completed</p>
            <p className="wn-projects-overview__tile-hint">Successfully delivered</p>
          </div>
          <span className="wn-projects-overview__tile-pct">{pct(stats.completed, stats.total)}%</span>
        </button>

        <button
          type="button"
          className={tileClass('cancelled')}
          onClick={() => onStageClick?.('cancelled')}
          aria-pressed={activeFilter === 'cancelled'}
        >
          <span className="wn-projects-overview__tile-icon">
            <CircleX size={18} />
          </span>
          <div>
            <p className="wn-projects-overview__tile-value">{stats.cancelled}</p>
            <p className="wn-projects-overview__tile-label">Cancelled</p>
            <p className="wn-projects-overview__tile-hint">Stopped engagements</p>
          </div>
          <span className="wn-projects-overview__tile-pct">{pct(stats.cancelled, stats.total)}%</span>
        </button>

        <article className="wn-projects-overview__tile wn-projects-overview__tile--portfolio">
          <span className="wn-projects-overview__tile-icon">
            <FolderKanban size={18} />
          </span>
          <div>
            <p className="wn-projects-overview__tile-value">{stats.total}</p>
            <p className="wn-projects-overview__tile-label">Portfolio</p>
            <p className="wn-projects-overview__tile-hint">All engagements</p>
          </div>
          <span className="wn-projects-overview__tile-pct">{livePct}% live</span>
        </article>
      </div>
    </section>
  );
}
