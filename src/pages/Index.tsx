
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ArtStylesGallery from "@/components/ArtStylesGallery";
import InteractiveDemo from "@/components/InteractiveDemo";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ArtStylesGallery />
      <InteractiveDemo />
    </div>
  );
};

export default Index;
