import { useEffect, useState } from "react";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/Navbar";
import ContactSection from "../../landing page/sections/ContactSection";
import CTABanner from "../../landing page/sections/CTABanner";
import FAQ from "../../landing page/sections/FAQ";
import FeaturedJobs from "../../landing page/sections/FeaturedJobs";
import Hero from "../../landing page/sections/Hero";
import HowItWorks from "../../landing page/sections/HowItWorks";
import Stats from "../../landing page/sections/Stats";
import TopFreelancers from "../../landing page/sections/TopFreelancers";
import { landingApi } from "../../api/landing.api";
import type { LandingFeaturedJob, LandingTopFreelancer } from "../../types/landing";

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState<LandingFeaturedJob[]>([]);
  const [freelancers, setFreelancers] = useState<LandingTopFreelancer[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [freelancersLoading, setFreelancersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    landingApi
      .getFeaturedJobs()
      .then((res) => {
        if (cancelled) return;
        setFeaturedJobs(res.data.data);
      })
      .catch(() => {
        if (cancelled) return;
        setFeaturedJobs([]);
      })
      .finally(() => {
        if (!cancelled) setJobsLoading(false);
      });

    landingApi
      .getTopFreelancers()
      .then((res) => {
        if (cancelled) return;
        setFreelancers(res.data.data);
      })
      .catch(() => {
        if (cancelled) return;
        setFreelancers([]);
      })
      .finally(() => {
        if (!cancelled) setFreelancersLoading(false);
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
      <FeaturedJobs
        jobs={featuredJobs}
        loading={jobsLoading}
        viewAllHref="/freelancer/jobs"
      />
      <TopFreelancers
        freelancers={freelancers}
        loading={freelancersLoading}
        viewAllHref="/freelancers"
      />
      <FAQ />
      <ContactSection />
      <CTABanner />
      <Footer />
    </div>
  );
}
