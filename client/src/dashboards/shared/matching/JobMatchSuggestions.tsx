import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass } from 'lucide-react';
import Button from '@/components/Button';
import MatchScoreRing from '@/dashboards/shared/matching/MatchScoreRing';
import type { Job } from '@/types/job';
import type { JobMatchSuggestion } from '@/types/matching';
import { formatCurrency } from '@/utils/format';
import '@/styles/Matching.css';

type Props = {
  suggestions: JobMatchSuggestion[];
  hint?: string;
  submittedJobIds?: Set<string>;
  onSubmitProposal?: (job: Job) => void;
};

function fitBand(score: number) {
  if (score >= 75) return 'Strong fit';
  if (score >= 50) return 'Solid fit';
  return 'Worth a look';
}

export default function JobMatchSuggestions({
  suggestions,
  hint,
  submittedJobIds,
  onSubmitProposal,
}: Props) {
  if (!suggestions.length) return null;

  return (
    <section className="wn-match-deck" aria-label="Suggested jobs for you">
      <header className="wn-match-deck__mast">
        <div className="wn-match-deck__mast-copy">
          <p className="wn-match-deck__kicker">
            <Compass size={14} aria-hidden />
            Match radar
          </p>
          <h3 className="wn-match-deck__headline">Jobs that line up with your skills</h3>
          <p className="wn-match-deck__hint">
            {hint || 'Suggestions only — applying still uses a normal proposal.'}
          </p>
        </div>
        <div className="wn-match-deck__count" aria-hidden>
          <span className="wn-match-deck__count-num">{suggestions.length}</span>
          <span className="wn-match-deck__count-label">signals</span>
        </div>
      </header>

      <ol className="wn-match-deck__track">
        {suggestions.map((item, index) => {
          const applied = submittedJobIds?.has(item.job._id);
          const featured = index === 0;
          return (
            <li
              key={item.job._id}
              className={`wn-match-tile${featured ? ' wn-match-tile--lead' : ''}`}
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
                <p className="wn-match-tile__cat">{item.job.category}</p>
                <h4 className="wn-match-tile__title">{item.job.title}</h4>
                <p className="wn-match-tile__reason">{item.reason}</p>

                <div className="wn-match-tile__meta">
                  <span className="wn-match-tile__budget">{formatCurrency(item.job.budget)}</span>
                  {item.breakdown.matchedSkills.length > 0 ? (
                    <ul className="wn-match-tile__skills">
                      {item.breakdown.matchedSkills.slice(0, featured ? 4 : 3).map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="wn-match-tile__actions">
                  <Link
                    to={`/freelancer/jobs/${item.job._id}`}
                    className="wn-match-tile__link"
                  >
                    Open job
                    <ArrowUpRight size={14} aria-hidden />
                  </Link>
                  {!applied && onSubmitProposal ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => onSubmitProposal(item.job)}
                    >
                      Propose
                    </Button>
                  ) : applied ? (
                    <span className="wn-match-tile__applied">Bid sent</span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
