import { Link } from "react-router-dom";
import type { LandingTopFreelancer } from "../../types/landing";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import "../css/TopFreelancers.css";

function initials(firstName: string, lastName: string) {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

export interface TopFreelancersProps {
  id?: string;
  title?: string;
  viewAllHref?: string;
  freelancers?: LandingTopFreelancer[];
  loading?: boolean;
}

/**
 * WorkNest Top Freelancers — grid of top-performing freelancers, ranked by
 * completed projects. Avatars use initials rather than stock photos to
 * avoid depicting unrelated real people.
 */
export default function TopFreelancers({
  id = "top-freelancers",
  title = "Top Freelancers",
  viewAllHref = "/login",
  freelancers = [],
  loading = false,
}: TopFreelancersProps) {
  return (
    <section id={id} className="wn-freelancers wn-landing-anchor">
      <div className="wn-freelancers__inner">
        <div className="wn-freelancers__header">
          <h2 className="wn-freelancers__title">{title}</h2>
          <Link to={viewAllHref} className="wn-freelancers__view-all">View All Freelancers →</Link>
        </div>

        {loading ? (
          <p className="wn-landing-section__message">Loading freelancers…</p>
        ) : freelancers.length === 0 ? (
          <div className="wn-empty">
            <p className="wn-empty__title">No freelancers yet</p>
            <p className="wn-empty__desc">Check back soon as more talent joins WorkNest.</p>
          </div>
        ) : (
          <div className="wn-freelancers__grid">
            {freelancers.map((f) => (
              <article className="wn-freelancer-card" key={f.freelancerId}>
                {f.profileImage ? (
                  <img
                    src={resolveMediaUrl(f.profileImage)}
                    alt=""
                    className="wn-freelancer-card__avatar"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <span className="wn-freelancer-card__avatar">
                    {initials(f.firstName, f.lastName)}
                  </span>
                )}
                <h3 className="wn-freelancer-card__name">
                  {f.firstName} {f.lastName}
                </h3>
                <p className="wn-freelancer-card__role">{f.skills?.[0] || "Freelancer"}</p>
                <div className="wn-freelancer-card__meta">
                  <span>{f.completedProjects} Projects</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
