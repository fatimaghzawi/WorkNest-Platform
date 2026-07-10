import "../css/Stats.css";

interface Stat {
  icon: string;
  value: string;
  label: string;
}

const DEFAULT_STATS: Stat[] = [
  { icon: "👥", value: "500+", label: "Freelancers" },
  { icon: "🧑‍💼", value: "200+", label: "Clients" },
  { icon: "📁", value: "800+", label: "Projects Completed" },
  { icon: "⭐", value: "95%", label: "Satisfaction Rate" },
];

export interface StatsProps {
  stats?: Stat[];
}

/**
 * WorkNest Stats bar — overlaps the bottom of the Hero section slightly,
 * a floating card of platform-trust numbers.
 */
export default function Stats({ stats = DEFAULT_STATS }: StatsProps) {
  return (
    <section className="wn-stats">
      <div className="wn-stats__inner">
        {stats.map((stat) => (
          <div className="wn-stat" key={stat.label}>
            <span className="wn-stat__icon" aria-hidden="true">{stat.icon}</span>
            <div>
              <div className="wn-stat__value">{stat.value}</div>
              <div className="wn-stat__label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
