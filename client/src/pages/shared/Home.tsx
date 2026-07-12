import { useEffect, useState } from "react";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/Navbar";
import ContactSection from "../../landing page/sections/ContactSection";
import CTABanner from "../../landing page/sections/CTABanner";
import FAQ from "../../landing page/sections/FAQ";
import FeaturedJobs, { type Job as FeaturedJob } from "../../landing page/sections/FeaturedJobs";
import Hero from "../../landing page/sections/Hero";
import HowItWorks from "../../landing page/sections/HowItWorks";
import Stats from "../../landing page/sections/Stats";
import TopFreelancers, { type Freelancer } from "../../landing page/sections/TopFreelancers";
import { jobsApi } from "../../api/jobs.api";
import { landingApi } from "../../api/landing.api";
import { formatCurrency, formatRelativeTime } from "../../utils/format";

export default function Home() {
  // undefined = still loading (section renders its own static defaults meanwhile)
  const [featuredJobs, setFeaturedJobs] = useState<FeaturedJob[] | undefined>(undefined);
  const [freelancers, setFreelancers] = useState<Freelancer[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    jobsApi
      .list({ status: "open", sort: "newest", limit: 4 })
      .then((res) => {
        if (cancelled) return;
        const jobs = res.data.data.map((job) => ({
          title: job.title,
          budget: formatCurrency(job.budget),
          category: job.category,
          tags: job.skills.slice(0, 3),
          postedAgo: formatRelativeTime(job.createdAt),
        }));
        setFeaturedJobs(jobs);
      })
      .catch(() => {
        // Keep the section's built-in defaults on failure.
      });

    landingApi
      .getTopFreelancers()
      .then((res) => {
        if (cancelled) return;
        setFreelancers(
          res.data.data.map((f) => ({
            name: `${f.firstName} ${f.lastName}`,
            role: f.skills?.[0] || "Freelancer",
            projects: f.completedProjects,
            
          }))
        );
      })
      .catch(() => {
        // Keep the section's built-in defaults on failure.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ background: "var(--color-brand-surface)" }}>
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <FeaturedJobs jobs={featuredJobs} viewAllHref="/freelancer/jobs" />
      <TopFreelancers freelancers={freelancers} viewAllHref="/freelancers" />
      <FAQ />
      <ContactSection />
      <CTABanner />
      <Footer />
    </div>
  );
}