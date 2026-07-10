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



export default function Home() {
  return (
    <div style={{ background: "var(--color-brand-surface)" }}>
      <Navbar/>
      <Hero />
      <Stats />
      <HowItWorks />
      <FeaturedJobs />
      <TopFreelancers />
      <FAQ/>
      <ContactSection/>
      <CTABanner />
      <Footer />
    </div>
  );
}