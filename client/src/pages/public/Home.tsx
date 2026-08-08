import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ContactSection from "@/features/landing/sections/ContactSection";
import CTABanner from "@/features/landing/sections/CTABanner";
import FAQ from "@/features/landing/sections/FAQ";
import FeaturedJobs from "@/features/landing/sections/FeaturedJobs";
import Hero from "@/features/landing/sections/Hero";
import HowItWorks from "@/features/landing/sections/HowItWorks";
import Stats from "@/features/landing/sections/Stats";
import TopFreelancers from "@/features/landing/sections/TopFreelancers";
import { landingApi } from "@/api/landing.api";
import type { LandingFeaturedJob, LandingTopFreelancer } from "@/types/landing";

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
        viewAllHref="/jobs"
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
