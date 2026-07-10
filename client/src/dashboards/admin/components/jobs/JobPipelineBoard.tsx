import { formatCurrency, formatDate } from '../../../../utils/format';
import type { Job } from '../../../../types/job';
import '../../../../css/JobsAdmin.css';

const LANES = [
  { status: 'open' as const, label: 'Open', hint: 'Accepting proposals' },
  { status: 'in_progress' as const, label: 'In progress', hint: 'Work underway' },
  { status: 'closed' as const, label: 'Closed', hint: 'Archived' },
];

function getClientName(job: Job) {
  if (typeof job.clientId === 'object') {
    return `${job.clientId.firstName} ${job.clientId.lastName}`;
  }
  return 'Client';
}

export default function JobPipelineBoard({
  jobs,
  selectedId,
  onSelect,
  visibleStatuses,
}: {
  jobs: Job[];
  selectedId?: string | null;
  onSelect: (job: Job) => void;
  visibleStatuses?: Array<'open' | 'in_progress' | 'closed'>;
}) {
  const lanes = visibleStatuses
    ? LANES.filter((lane) => visibleStatuses.includes(lane.status))
    : LANES;

  return (
    <div className="wn-job-board" aria-label="Job pipeline board">
      {lanes.map((lane) => {
        const laneJobs = jobs.filter((job) => job.status === lane.status);

        return (
          <section key={lane.status} className={`wn-job-lane wn-job-lane--${lane.status}`}>
            <header className="wn-job-lane__head">
              <div>
                <p className="wn-job-lane__label">{lane.label}</p>
                <p className="wn-job-lane__hint">{lane.hint}</p>
              </div>
              <span className="wn-job-lane__count">{laneJobs.length}</span>
            </header>

            <div className="wn-job-lane__stack">
              {laneJobs.length === 0 ? (
                <p className="wn-job-lane__empty">No jobs here</p>
              ) : (
                laneJobs.map((job) => (
                  <button
                    key={job._id}
                    type="button"
                    className={[
                      'wn-job-ticket',
                      selectedId === job._id ? 'wn-job-ticket--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => onSelect(job)}
                  >
                    <p className="wn-job-ticket__title">{job.title}</p>
                    <p className="wn-job-ticket__meta">{getClientName(job)}</p>
                    <div className="wn-job-ticket__footer">
                      <span className="wn-job-ticket__budget">{formatCurrency(job.budget)}</span>
                      <span className="wn-job-ticket__date">{formatDate(job.deadline)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
