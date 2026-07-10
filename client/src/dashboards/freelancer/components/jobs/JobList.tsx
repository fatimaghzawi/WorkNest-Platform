import { Job } from "../../../../types/job";
import JobCard from "./JobCard";

interface JobListProps {
  jobs: Job[];
  submittedJobIds?: Set<string>;
  onSubmitProposal?: (job: Job) => void;
}

export default function JobList({
  jobs,
  submittedJobIds,
  onSubmitProposal,
}: JobListProps) {
  if (!jobs.length) {
    return (
      <section className="wn-dash-empty">
        <h3 className="wn-dash-empty__title">
          No jobs found
        </h3>

        <p>
          Try adjusting your search or filters to
          discover more opportunities.
        </p>
      </section>
    );
  }

  return (
    <section className="wn-dash-card-list">
      {jobs.map((job) => (
        <JobCard
          key={job._id}
          job={job}
          hasSubmittedProposal={submittedJobIds?.has(job._id)}
          onSubmitProposal={onSubmitProposal}
        />
      ))}
    </section>
  );
}