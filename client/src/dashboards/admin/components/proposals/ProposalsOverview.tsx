import { CircleCheck, CircleX, Clock3, Inbox } from 'lucide-react';
import type { ProposalStatus } from '../../../../types/proposal';

export interface ProposalPipelineStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

type StatusFilter = ProposalStatus | 'all';

export default function ProposalsOverview({
  stats,
  activeFilter = 'all',
  onStageClick,
}: {
  stats: ProposalPipelineStats;
  activeFilter?: StatusFilter;
  onStageClick?: (status: ProposalStatus) => void;
}) {
  const decided = stats.accepted + stats.rejected;
  const acceptancePct = pct(stats.accepted, decided || stats.total);
  const mix = [
    { key: 'pending', value: stats.pending, color: '#b45309' },
    { key: 'accepted', value: stats.accepted, color: '#15803d' },
    { key: 'rejected', value: stats.rejected, color: '#b91c1c' },
  ].filter((item) => item.value > 0);

  const tileClass = (status: ProposalStatus) =>
    [
      'wn-proposals-overview__tile',
      `wn-proposals-overview__tile--${status}`,
      activeFilter === status ? 'wn-proposals-overview__tile--active' : '',
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <section className="wn-proposals-overview" aria-label="Proposal pipeline overview">
      <div className="wn-proposals-overview__spotlight">
        <div className="wn-proposals-overview__glow" aria-hidden />
        <div className="wn-proposals-overview__rings" aria-hidden>
          <span />
          <span />
        </div>
        <p className="wn-proposals-overview__eyebrow">Proposal snapshot</p>
        <p className="wn-proposals-overview__total">{stats.total.toLocaleString()}</p>
        <p className="wn-proposals-overview__headline">Submissions on WorkNest</p>
        <p className="wn-proposals-overview__caption">
          {stats.pending} awaiting review · {pct(stats.pending, stats.total)}% still open
        </p>
        <div className="wn-proposals-overview__meter" aria-hidden>
          <span style={{ width: `${Math.max(pct(stats.pending, stats.total), 8)}%` }} />
        </div>
        {stats.total > 0 && (
          <div className="wn-proposals-overview__mix" aria-label="Status distribution">
            <div className="wn-proposals-overview__mix-bar">
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
            <div className="wn-proposals-overview__mix-legend">
              <span>Pending {pct(stats.pending, stats.total)}%</span>
              <span>Accepted {pct(stats.accepted, stats.total)}%</span>
              <span>Rejected {pct(stats.rejected, stats.total)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="wn-proposals-overview__tiles">
        <button
          type="button"
          className={tileClass('pending')}
          onClick={() => onStageClick?.('pending')}
          aria-pressed={activeFilter === 'pending'}
        >
          <span className="wn-proposals-overview__tile-icon">
            <Clock3 size={18} />
          </span>
          <div>
            <p className="wn-proposals-overview__tile-value">{stats.pending}</p>
            <p className="wn-proposals-overview__tile-label">Pending</p>
            <p className="wn-proposals-overview__tile-hint">Awaiting decision</p>
          </div>
          <span className="wn-proposals-overview__tile-pct">{pct(stats.pending, stats.total)}%</span>
        </button>

        <button
          type="button"
          className={tileClass('accepted')}
          onClick={() => onStageClick?.('accepted')}
          aria-pressed={activeFilter === 'accepted'}
        >
          <span className="wn-proposals-overview__tile-icon">
            <CircleCheck size={18} />
          </span>
          <div>
            <p className="wn-proposals-overview__tile-value">{stats.accepted}</p>
            <p className="wn-proposals-overview__tile-label">Accepted</p>
            <p className="wn-proposals-overview__tile-hint">Won by freelancers</p>
          </div>
          <span className="wn-proposals-overview__tile-pct">{pct(stats.accepted, stats.total)}%</span>
        </button>

        <button
          type="button"
          className={tileClass('rejected')}
          onClick={() => onStageClick?.('rejected')}
          aria-pressed={activeFilter === 'rejected'}
        >
          <span className="wn-proposals-overview__tile-icon">
            <CircleX size={18} />
          </span>
          <div>
            <p className="wn-proposals-overview__tile-value">{stats.rejected}</p>
            <p className="wn-proposals-overview__tile-label">Rejected</p>
            <p className="wn-proposals-overview__tile-hint">Declined submissions</p>
          </div>
          <span className="wn-proposals-overview__tile-pct">{pct(stats.rejected, stats.total)}%</span>
        </button>

        <article className="wn-proposals-overview__tile wn-proposals-overview__tile--queue">
          <span className="wn-proposals-overview__tile-icon">
            <Inbox size={18} />
          </span>
          <div>
            <p className="wn-proposals-overview__tile-value">{acceptancePct}%</p>
            <p className="wn-proposals-overview__tile-label">Acceptance rate</p>
            <p className="wn-proposals-overview__tile-hint">Of decided proposals</p>
          </div>
          <span className="wn-proposals-overview__tile-pct">{decided} decided</span>
        </article>
      </div>
    </section>
  );
}
