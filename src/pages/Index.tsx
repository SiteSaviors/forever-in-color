
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ArtStylesGallery from "@/components/ArtStylesGallery";
import HowItWorks from "@/components/HowItWorks";
import InteractiveDemo from "@/components/InteractiveDemo";
import Testimonials from "@/components/Testimonials";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ArtStylesGallery />
      <HowItWorks />
      <InteractiveDemo />
      <Testimonials />
    </div>
  );
};

export default Index;
