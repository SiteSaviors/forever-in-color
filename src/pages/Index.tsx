
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LogoMarquee from "@/components/LogoMarquee";
import HowItWorks from "@/components/HowItWorks";
import EmotionalJourney from "@/components/EmotionalJourney";
import ArtStylesCarousel from "@/components/ArtStylesCarousel";
import ArtStylesGallery from "@/components/ArtStylesGallery";
import InteractiveDemo from "@/components/InteractiveDemo";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <LogoMarquee />
      <HowItWorks />
      <EmotionalJourney />
      <ArtStylesCarousel />
      <ArtStylesGallery />
      <InteractiveDemo />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
