import { Link } from "react-router-dom";
import type { LandingFeaturedJob } from "../../types/landing";
import { formatCurrency, formatRelativeTime } from "../../utils/format";
import "../css/FeaturedJobs.css";

export interface FeaturedJobsProps {
  id?: string;
  title?: string;
  viewAllHref?: string;
  jobs?: LandingFeaturedJob[];
  loading?: boolean;
}

export default function FeaturedJobs({
  id = "featured-jobs",
  title = "Featured Jobs",
  viewAllHref = "/jobs",
  jobs = [],
  loading = false,
}: FeaturedJobsProps) {
  return (
    <section id={id} className="wn-jobs wn-landing-anchor">
      <div className="wn-jobs__inner">
        <div className="wn-jobs__header">
          <h2 className="wn-jobs__title">{title}</h2>
          <Link to={viewAllHref} className="wn-jobs__view-all">View All Jobs →</Link>
        </div>

        {loading ? (
          <p className="wn-landing-section__message">Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <div className="wn-empty">
            <p className="wn-empty__title">No open jobs yet</p>
            <p className="wn-empty__desc">Check back soon as clients post new opportunities.</p>
          </div>
        ) : (
          <div className="wn-jobs__grid">
            {jobs.map((job) => (
              <article className="wn-job-card" key={job.id}>
                <h3 className="wn-job-card__title">{job.title}</h3>
                <span className="wn-job-card__budget">{formatCurrency(job.budget)}</span>
                <span className="wn-job-card__category">{job.category}</span>
                <div className="wn-job-card__tags">
                  {job.skills.slice(0, 3).map((tag) => (
                    <span className="wn-job-card__tag" key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="wn-job-card__footer">
                  <span className="wn-job-card__posted">{formatRelativeTime(job.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
