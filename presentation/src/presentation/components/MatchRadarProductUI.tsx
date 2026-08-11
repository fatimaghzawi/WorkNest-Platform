/** Presentation mock of the live WorkNest Match / Talent radar UI. */

type JobTile = {
  rank: string;
  title: string;
  category: string;
  reason: string;
  budget: string;
  score: number;
  band: string;
  skills: string[];
  lead?: boolean;
};

type TalentTile = {
  rank: string;
  name: string;
  initials: string;
  avatar?: string;
  reason: string;
  score: number;
  band: string;
  skills: string[];
  lead?: boolean;
};

const JOBS: JobTile[] = [
  {
    rank: '01',
    title: 'Full-stack inventory dashboard',
    category: 'Full-stack',
    reason: '3 of 4 required skills match',
    budget: '$1,950',
    score: 92,
    band: 'Strong fit',
    skills: ['React', 'TypeScript', 'Node.js'],
    lead: true,
  },
  {
    rank: '02',
    title: 'Store analytics UI — charts & filters',
    category: 'Frontend',
    reason: '2 of 3 required skills match',
    budget: '$1,200',
    score: 78,
    band: 'Solid fit',
    skills: ['React', 'Charts'],
  },
  {
    rank: '03',
    title: 'Ops API for warehouse sync',
    category: 'Backend',
    reason: 'Skills overlap on Node + API design',
    budget: '$1,400',
    score: 64,
    band: 'Worth a look',
    skills: ['Node.js', 'API'],
  },
];

const TALENT: TalentTile[] = [
  {
    rank: '01',
    name: 'Jack Rivera',
    initials: 'JR',
    avatar: '/avatars/freelancer.jpg',
    reason: '4 of 4 job skills match',
    score: 94,
    band: 'Strong fit',
    skills: ['React', 'TypeScript', 'Node.js', 'API'],
    lead: true,
  },
  {
    rank: '02',
    name: 'Amira Chen',
    initials: 'AC',
    reason: '3 of 4 job skills match',
    score: 81,
    band: 'Solid fit',
    skills: ['React', 'UI', 'API'],
  },
  {
    rank: '03',
    name: 'Leo Park',
    initials: 'LP',
    reason: '2 of 4 job skills match',
    score: 58,
    band: 'Possible fit',
    skills: ['React', 'Node.js'],
  },
];

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const stroke = 3.5;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="wn-pres-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(73,34,91,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#0f766e"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="wn-pres-ring__label">
        <span className="wn-pres-ring__value">{score}</span>
        <span className="wn-pres-ring__unit">%</span>
      </div>
    </div>
  );
}

export function FreelancerMatchRadarUI() {
  return (
    <section className="wn-pres-deck" aria-label="Match radar — jobs">
      <header className="wn-pres-deck__mast">
        <div className="wn-pres-deck__mast-copy">
          <p className="wn-pres-deck__kicker">◎ Match radar</p>
          <h3 className="wn-pres-deck__headline">Jobs that line up with your skills</h3>
          <p className="wn-pres-deck__hint">
            Suggestions only — applying still uses a normal proposal.
          </p>
        </div>
        <div className="wn-pres-deck__count">
          <span className="wn-pres-deck__count-num">{JOBS.length}</span>
          <span className="wn-pres-deck__count-label">signals</span>
        </div>
      </header>
      <ol className="wn-pres-deck__track wn-pres-deck__track--row">
        {JOBS.map((job) => (
          <li
            key={job.rank}
            className={`wn-pres-tile${job.lead ? ' wn-pres-tile--lead' : ''}`}
          >
            <div className="wn-pres-tile__rank">{job.rank}</div>
            <div className="wn-pres-tile__meter">
              <span className="wn-pres-tile__band">{job.band}</span>
              <ScoreRing score={job.score} size={job.lead ? 44 : 38} />
            </div>
            <div className="wn-pres-tile__body">
              <p className="wn-pres-tile__cat">{job.category}</p>
              <h4 className="wn-pres-tile__title">{job.title}</h4>
              <p className="wn-pres-tile__reason">{job.reason}</p>
              <p className="wn-pres-tile__budget">{job.budget}</p>
              <ul className="wn-pres-tile__skills">
                {job.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <div className="wn-pres-tile__actions">
                <span className="wn-pres-tile__link">Open job ↗</span>
                <span className="wn-pres-tile__btn">Propose</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ClientMatchRadarUI() {
  return (
    <section className="wn-pres-deck wn-pres-deck--talent" aria-label="Talent radar">
      <header className="wn-pres-deck__mast">
        <div className="wn-pres-deck__mast-copy">
          <p className="wn-pres-deck__kicker">◎ Talent radar</p>
          <h3 className="wn-pres-deck__headline">Freelancers who match this job</h3>
          <p className="wn-pres-deck__hint">
            Suggestions only — freelancers still apply. This never starts a project.
          </p>
        </div>
        <div className="wn-pres-deck__count">
          <span className="wn-pres-deck__count-num">{TALENT.length}</span>
          <span className="wn-pres-deck__count-label">signals</span>
        </div>
      </header>
      <ol className="wn-pres-deck__track wn-pres-deck__track--row">
        {TALENT.map((person) => (
          <li
            key={person.rank}
            className={`wn-pres-tile wn-pres-tile--talent${person.lead ? ' wn-pres-tile--lead' : ''}`}
          >
            <div className="wn-pres-tile__rank">{person.rank}</div>
            <div className="wn-pres-tile__meter">
              <span className="wn-pres-tile__band">{person.band}</span>
              <ScoreRing score={person.score} size={person.lead ? 44 : 38} />
            </div>
            <div className="wn-pres-tile__body">
              <div className="wn-pres-tile__person">
                {person.avatar ? (
                  <img
                    src={person.avatar}
                    alt=""
                    className="wn-pres-avatar wn-pres-avatar--photo"
                  />
                ) : (
                  <span className="wn-pres-avatar">{person.initials}</span>
                )}
                <div>
                  <h4 className="wn-pres-tile__title">{person.name}</h4>
                  <p className="wn-pres-tile__reason">{person.reason}</p>
                </div>
              </div>
              <ul className="wn-pres-tile__skills">
                {person.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <div className="wn-pres-tile__actions">
                <span className="wn-pres-tile__link">View profile ↗</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
