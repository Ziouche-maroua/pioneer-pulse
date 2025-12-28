import Header from "@/components/Scroll/Header";
import HeroSection from "@/components/Scroll/HeroSection";
import FeaturesOverview from "@/components/Scroll/FeaturesOverview";
import DashboardPreview from "@/components/Scroll/DashboardPreview";
import ProblemSolving from "@/components/Scroll/ProblemSolving";
import Testimonials from "@/components/Scroll/Testimonials";
import CTASection from "@/components/Scroll/CTASection";
import Footer from "@/components/Scroll/Footer";

const Scroll = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesOverview />
        <DashboardPreview />
        <ProblemSolving />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Scroll;