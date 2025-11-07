import { Navbar } from "./_components/Navbar";
import { Hero } from "./_components/Hero";
import { TrustBar } from "./_components/TrustBar";
import { Benefits } from "./_components/Benefits";
import { Process } from "./_components/Process";
import { DashboardMock } from "./_components/DashboardMock";
import { FeaturesGrid } from "./_components/FeaturesGrid";
import { Testimonials } from "./_components/Testimonials";
import { FAQ } from "./_components/FAQ";
import { CTA } from "./_components/CTA";
import { Footer } from "./_components/Footer";

export default function MarketingPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Hero />
        <TrustBar />
        <Benefits />
        <Process />
        <DashboardMock />
        <FeaturesGrid />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
