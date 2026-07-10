import { Briefcase, Shield, Sparkles, Users } from 'lucide-react';
import type { UserStats } from '../../../../types/user';

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export default function UsersDirectoryOverview({ stats }: { stats: UserStats }) {
  const activePct = pct(stats.active, stats.total);
  const mix = [
    { key: 'clients', value: stats.clients, color: '#6e3482' },
    { key: 'freelancers', value: stats.freelancers, color: '#0f766e' },
    { key: 'admins', value: stats.admins, color: '#ea580c' },
  ].filter((item) => item.value > 0);

  return (
    <section className="wn-users-overview" aria-label="Community overview">
      <div className="wn-users-overview__spotlight">
        <div className="wn-users-overview__glow" aria-hidden />
        <div className="wn-users-overview__rings" aria-hidden>
          <span />
          <span />
        </div>
        <p className="wn-users-overview__eyebrow">Community snapshot</p>
        <p className="wn-users-overview__total">{stats.total.toLocaleString()}</p>
        <p className="wn-users-overview__headline">Members on WorkNest</p>
        <p className="wn-users-overview__caption">
          {stats.active} active right now · {activePct}% engagement
        </p>
        <div className="wn-users-overview__meter" aria-hidden>
          <span style={{ width: `${Math.max(activePct, 8)}%` }} />
        </div>
        {stats.total > 0 && (
          <div className="wn-users-overview__mix" aria-label="Role distribution">
            <div className="wn-users-overview__mix-bar">
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
            <div className="wn-users-overview__mix-legend">
              <span>Clients {pct(stats.clients, stats.total)}%</span>
              <span>Freelancers {pct(stats.freelancers, stats.total)}%</span>
              <span>Admins {pct(stats.admins, stats.total)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="wn-users-overview__tiles">
        <article className="wn-users-overview__tile wn-users-overview__tile--clients">
          <span className="wn-users-overview__tile-icon">
            <Briefcase size={18} />
          </span>
          <div>
            <p className="wn-users-overview__tile-value">{stats.clients}</p>
            <p className="wn-users-overview__tile-label">Clients</p>
            <p className="wn-users-overview__tile-hint">Hiring & posting jobs</p>
          </div>
          <span className="wn-users-overview__tile-pct">{pct(stats.clients, stats.total)}%</span>
        </article>

        <article className="wn-users-overview__tile wn-users-overview__tile--freelancers">
          <span className="wn-users-overview__tile-icon">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="wn-users-overview__tile-value">{stats.freelancers}</p>
            <p className="wn-users-overview__tile-label">Freelancers</p>
            <p className="wn-users-overview__tile-hint">Talent & proposals</p>
          </div>
          <span className="wn-users-overview__tile-pct">{pct(stats.freelancers, stats.total)}%</span>
        </article>

        <article className="wn-users-overview__tile wn-users-overview__tile--active">
          <span className="wn-users-overview__tile-icon">
            <Users size={18} />
          </span>
          <div>
            <p className="wn-users-overview__tile-value">{stats.active}</p>
            <p className="wn-users-overview__tile-label">Active</p>
            <p className="wn-users-overview__tile-hint">Signed-in accounts</p>
          </div>
          <span className="wn-users-overview__tile-pct">{activePct}%</span>
        </article>

        <article className="wn-users-overview__tile wn-users-overview__tile--admins">
          <span className="wn-users-overview__tile-icon">
            <Shield size={18} />
          </span>
          <div>
            <p className="wn-users-overview__tile-value">{stats.admins}</p>
            <p className="wn-users-overview__tile-label">Admins</p>
            <p className="wn-users-overview__tile-hint">Platform operators</p>
          </div>
          <span className="wn-users-overview__tile-pct">{pct(stats.admins, stats.total)}%</span>
        </article>
      </div>
    </section>
  );
}
