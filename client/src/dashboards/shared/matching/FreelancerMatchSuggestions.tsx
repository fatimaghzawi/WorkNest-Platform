import { Link } from 'react-router-dom';
import { ArrowUpRight, Radar } from 'lucide-react';
import UserAvatar from '@/features/users/UserAvatar';
import MatchScoreRing from '@/dashboards/shared/matching/MatchScoreRing';
import type { FreelancerMatchSuggestion } from '@/types/matching';
import '@/styles/Matching.css';

type Props = {
  suggestions: FreelancerMatchSuggestion[];
  hint?: string;
};

function fitBand(score: number) {
  if (score >= 75) return 'Strong fit';
  if (score >= 50) return 'Solid fit';
  return 'Possible fit';
}

export default function FreelancerMatchSuggestions({ suggestions, hint }: Props) {
  if (!suggestions.length) return null;

  return (
    <section className="wn-match-deck wn-match-deck--talent" aria-label="Suggested freelancers">
      <header className="wn-match-deck__mast">
        <div className="wn-match-deck__mast-copy">
          <p className="wn-match-deck__kicker">
            <Radar size={14} aria-hidden />
            Talent radar
          </p>
          <h3 className="wn-match-deck__headline">Freelancers who match this job</h3>
          <p className="wn-match-deck__hint">
            {hint ||
              'Suggestions only — freelancers still apply with a proposal. This never starts a project.'}
          </p>
        </div>
        <div className="wn-match-deck__count" aria-hidden>
          <span className="wn-match-deck__count-num">{suggestions.length}</span>
          <span className="wn-match-deck__count-label">signals</span>
        </div>
      </header>

      <ol className="wn-match-deck__track">
        {suggestions.map((item, index) => {
          const name = `${item.freelancer.firstName} ${item.freelancer.lastName}`.trim();
          const featured = index === 0;
          return (
            <li
              key={item.freelancer._id}
              className={`wn-match-tile wn-match-tile--talent${featured ? ' wn-match-tile--lead' : ''}`}
              style={{ ['--wn-match-i' as string]: index }}
            >
              <div className="wn-match-tile__rank" aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="wn-match-tile__meter">
                <span className="wn-match-tile__band">{fitBand(item.score)}</span>
                <MatchScoreRing score={item.score} size={featured ? 56 : 48} />
              </div>

              <div className="wn-match-tile__body">
                <div className="wn-match-tile__person">
                  <UserAvatar
                    firstName={item.freelancer.firstName}
                    lastName={item.freelancer.lastName}
                    role="freelancer"
                    image={item.freelancer.profileImage}
                    size={featured ? 'md' : 'sm'}
                  />
                  <div>
                    <h4 className="wn-match-tile__title">{name}</h4>
                    <p className="wn-match-tile__reason">{item.reason}</p>
                  </div>
                </div>

                {item.breakdown.matchedSkills.length > 0 ? (
                  <ul className="wn-match-tile__skills">
                    {item.breakdown.matchedSkills.slice(0, featured ? 5 : 4).map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : null}

                <div className="wn-match-tile__actions">
                  <Link
                    to={`/client/freelancers/${item.freelancer._id}`}
                    className="wn-match-tile__link"
                  >
                    View profile
                    <ArrowUpRight size={14} aria-hidden />
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
