import { Link } from "react-router-dom";
import "../css/TopFreelancers.css";

export interface Freelancer {
  name: string;
  role: string;
  projects: number;
}

const DEFAULT_FREELANCERS: Freelancer[] = [
  { name: "Sarah Johnson", role: "Full Stack Developer", projects: 32 },
  { name: "James Smith", role: "UI/UX Designer", projects: 28 },
  { name: "Emily Davis", role: "Content Writer", projects: 45 },
  { name: "Michael Brown", role: "Mobile Developer", projects: 20 },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export interface TopFreelancersProps {
  id?: string;
  title?: string;
  viewAllHref?: string;
  freelancers?: Freelancer[];
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
  freelancers = DEFAULT_FREELANCERS,
}: TopFreelancersProps) {
  return (
    <section id={id} className="wn-freelancers wn-landing-anchor">
      <div className="wn-freelancers__inner">
        <div className="wn-freelancers__header">
          <h2 className="wn-freelancers__title">{title}</h2>
          <Link to={viewAllHref} className="wn-freelancers__view-all">View All Freelancers →</Link>
        </div>

        <div className="wn-freelancers__grid">
          {freelancers.map((f) => (
            <article className="wn-freelancer-card" key={f.name}>
              <span className="wn-freelancer-card__avatar">{initials(f.name)}</span>
              <h3 className="wn-freelancer-card__name">{f.name}</h3>
              <p className="wn-freelancer-card__role">{f.role}</p>
              <div className="wn-freelancer-card__meta">
                <span>{f.projects} Projects</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}