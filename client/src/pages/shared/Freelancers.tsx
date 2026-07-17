import { useEffect, useState } from "react";
import Pagination from "../../components/common/Pagination";
import { landingApi } from "../../api/landing.api";
import type { LandingTopFreelancer } from "../../types/landing";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import "../../css/StaticPage.css";
import "../../landing page/css/TopFreelancers.css";

function initials(firstName: string, lastName: string) {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState<LandingTopFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    landingApi
      .listFreelancers({ page, limit: 12 })
      .then((res) => {
        if (cancelled) return;
        setFreelancers(res.data.data);
        setTotalPages(res.data.meta?.totalPages || 1);
      })
      .catch(() => {
        if (cancelled) return;
        setFreelancers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="wn-static-page">
      <div className="wn-static-page__inner wn-static-page__inner--wide">
        <span className="wn-static-page__eyebrow">Talent</span>
        <h1 className="wn-static-page__title">All Freelancers</h1>
        <p className="wn-static-page__subtitle">
          Browse skilled freelancers on WorkNest, ranked by completed projects.
        </p>

        {loading ? (
          <p className="wn-empty-inline">Loading freelancers…</p>
        ) : freelancers.length === 0 ? (
          <div className="wn-empty">
            <p className="wn-empty__title">No freelancers found</p>
            <p className="wn-empty__desc">Check back soon as more freelancers join WorkNest.</p>
          </div>
        ) : (
          <>
            <div className="wn-freelancers__grid" style={{ marginBottom: "var(--space-6)" }}>
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

            {totalPages > 1 && (
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}