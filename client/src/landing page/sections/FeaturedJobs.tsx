import { Link } from "react-router-dom";
import "../css/FeaturedJobs.css";

export interface Job {
  title: string;
  budget: string;
  category: string;
  tags: string[];
  postedAgo: string;
}

const DEFAULT_JOBS: Job[] = [
  { title: "E-commerce Website Development", budget: "$800 - $1,500", category: "Web Development", tags: ["React", "Node.js", "MongoDB"], postedAgo: "2 days ago" },
  { title: "Mobile App UI/UX Design", budget: "$300 - $700", category: "UI/UX Design", tags: ["Figma", "UI Design", "Prototyping"], postedAgo: "1 day ago" },
  { title: "Content Writing for Blog", budget: "$100 - $200", category: "Writing", tags: ["Article", "Blog", "SEO"], postedAgo: "3 days ago" },
  { title: "WordPress Development", budget: "$200 - $500", category: "Web Development", tags: ["WordPress", "PHP", "Elementor"], postedAgo: "5 days ago" },
];

export interface FeaturedJobsProps {
  id?: string;
  title?: string;
  viewAllHref?: string;
  jobs?: Job[];
}


export default function FeaturedJobs({
  id = "featured-jobs",
  title = "Featured Jobs",
  viewAllHref = "/login",
  jobs = DEFAULT_JOBS,
}: FeaturedJobsProps) {
  return (
    <section id={id} className="wn-jobs wn-landing-anchor">
      <div className="wn-jobs__inner">
        <div className="wn-jobs__header">
          <h2 className="wn-jobs__title">{title}</h2>
          <Link to={viewAllHref} className="wn-jobs__view-all">View All Jobs →</Link>
        </div>

        <div className="wn-jobs__grid">
          {jobs.map((job) => (
            <article className="wn-job-card" key={job.title}>
              <h3 className="wn-job-card__title">{job.title}</h3>
              <span className="wn-job-card__budget">{job.budget}</span>
              <span className="wn-job-card__category">{job.category}</span>
              <div className="wn-job-card__tags">
                {job.tags.map((tag) => (
                  <span className="wn-job-card__tag" key={tag}>{tag}</span>
                ))}
              </div>
              <div className="wn-job-card__footer">
                <span className="wn-job-card__posted">{job.postedAgo}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
