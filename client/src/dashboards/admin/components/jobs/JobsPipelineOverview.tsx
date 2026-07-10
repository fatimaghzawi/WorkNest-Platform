import { Briefcase, CircleCheck, CirclePause, FolderOpen } from 'lucide-react';
import type { JobStatus } from '../../../../types/job';

export interface JobPipelineStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
}

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

type StageFilter = JobStatus | 'all';

export default function JobsPipelineOverview({
  stats,
  activeFilter = 'all',
  onStageClick,
}: {
  stats: JobPipelineStats;
  activeFilter?: StageFilter;
  onStageClick?: (status: JobStatus) => void;
}) {
  const live = stats.open + stats.inProgress;
  const livePct = pct(live, stats.total);
  const mix = [
    { key: 'open', value: stats.open, color: '#15803d' },
    { key: 'in_progress', value: stats.inProgress, color: '#b45309' },
    { key: 'closed', value: stats.closed, color: '#6b7280' },
  ].filter((item) => item.value > 0);

  const tileClass = (status: JobStatus) =>
    [
      'wn-jobs-overview__tile',
      `wn-jobs-overview__tile--${status}`,
      activeFilter === status ? 'wn-jobs-overview__tile--active' : '',
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <section className="wn-jobs-overview" aria-label="Job pipeline overview">
      <div className="wn-jobs-overview__spotlight">
        <div className="wn-jobs-overview__glow" aria-hidden />
        <div className="wn-jobs-overview__rings" aria-hidden>
          <span />
          <span />
        </div>
        <p className="wn-jobs-overview__eyebrow">Pipeline snapshot</p>
        <p className="wn-jobs-overview__total">{stats.total.toLocaleString()}</p>
        <p className="wn-jobs-overview__headline">Jobs on WorkNest</p>
        <p className="wn-jobs-overview__caption">
          {live} live in pipeline · {livePct}% still active
        </p>
        <div className="wn-jobs-overview__meter" aria-hidden>
          <span style={{ width: `${Math.max(livePct, 8)}%` }} />
        </div>
        {stats.total > 0 && (
          <div className="wn-jobs-overview__mix" aria-label="Status distribution">
            <div className="wn-jobs-overview__mix-bar">
              {mix.map((item) => (
                <span
                  key={item.key}
                  style={{
                    flexGrow: item.value,
                    background: item.color,
                  }}
                  title={`${item.key}: ${item.value}`}
                />
              ))}
            </div>
            <div className="wn-jobs-overview__mix-legend">
              <span>Open {pct(stats.open, stats.total)}%</span>
              <span>In progress {pct(stats.inProgress, stats.total)}%</span>
              <span>Closed {pct(stats.closed, stats.total)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="wn-jobs-overview__tiles">
        <button
          type="button"
          className={tileClass('open')}
          onClick={() => onStageClick?.('open')}
          aria-pressed={activeFilter === 'open'}
        >
          <span className="wn-jobs-overview__tile-icon">
            <FolderOpen size={18} />
          </span>
          <div>
            <p className="wn-jobs-overview__tile-value">{stats.open}</p>
            <p className="wn-jobs-overview__tile-label">Open</p>
            <p className="wn-jobs-overview__tile-hint">Accepting proposals</p>
          </div>
          <span className="wn-jobs-overview__tile-pct">{pct(stats.open, stats.total)}%</span>
        </button>

        <button
          type="button"
          className={tileClass('in_progress')}
          onClick={() => onStageClick?.('in_progress')}
          aria-pressed={activeFilter === 'in_progress'}
        >
          <span className="wn-jobs-overview__tile-icon">
            <Briefcase size={18} />
          </span>
          <div>
            <p className="wn-jobs-overview__tile-value">{stats.inProgress}</p>
            <p className="wn-jobs-overview__tile-label">In progress</p>
            <p className="wn-jobs-overview__tile-hint">Work underway</p>
          </div>
          <span className="wn-jobs-overview__tile-pct">{pct(stats.inProgress, stats.total)}%</span>
        </button>

        <button
          type="button"
          className={tileClass('closed')}
          onClick={() => onStageClick?.('closed')}
          aria-pressed={activeFilter === 'closed'}
        >
          <span className="wn-jobs-overview__tile-icon">
            <CirclePause size={18} />
          </span>
          <div>
            <p className="wn-jobs-overview__tile-value">{stats.closed}</p>
            <p className="wn-jobs-overview__tile-label">Closed</p>
            <p className="wn-jobs-overview__tile-hint">No longer active</p>
          </div>
          <span className="wn-jobs-overview__tile-pct">{pct(stats.closed, stats.total)}%</span>
        </button>

        <article className="wn-jobs-overview__tile wn-jobs-overview__tile--live">
          <span className="wn-jobs-overview__tile-icon">
            <CircleCheck size={18} />
          </span>
          <div>
            <p className="wn-jobs-overview__tile-value">{live}</p>
            <p className="wn-jobs-overview__tile-label">Live pipeline</p>
            <p className="wn-jobs-overview__tile-hint">Open + in progress</p>
          </div>
          <span className="wn-jobs-overview__tile-pct">{livePct}%</span>
        </article>
      </div>
    </section>
  );
}
