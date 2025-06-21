
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WatercolorDreamsHero from "@/components/watercolor-dreams/WatercolorDreamsHero";
import WatercolorDreamsGallery from "@/components/watercolor-dreams/WatercolorDreamsGallery";
import WatercolorDreamsFeatures from "@/components/watercolor-dreams/WatercolorDreamsFeatures";
import WatercolorDreamsHowItWorks from "@/components/watercolor-dreams/WatercolorDreamsHowItWorks";
import WatercolorDreamsARPreview from "@/components/watercolor-dreams/WatercolorDreamsARPreview";
import WatercolorDreamsTestimonials from "@/components/watercolor-dreams/WatercolorDreamsTestimonials";

const WatercolorDreams = () => {
  const navigate = useNavigate();
  const [showStickyButton, setShowStickyButton] = useState(false);

  // Handle sticky button visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStartCreating = () => {
    navigate("/product", { state: { preSelectedStyle: 4, styleName: "Watercolor Dreams" } });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <WatercolorDreamsHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            Unleash your emotions with bold, expressive watercolor artistry. This dynamic style captures the raw energy and spontaneous beauty of free-flowing paint, creating vibrant masterpieces that pulse with life and movement. Perfect for those who want their memories transformed into passionate works of art.
          </p>
        </div>
      </section>

      <WatercolorDreamsFeatures />
      <WatercolorDreamsGallery />
      <WatercolorDreamsHowItWorks />
      <WatercolorDreamsARPreview />
      <WatercolorDreamsTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom expressive watercolor painting from photo, AI-generated dynamic art, bold brushstroke style, energetic gift idea, Forever in Color Watercolor Dreams style. Transform your cherished memories into vibrant artwork with dramatic color splashes and spontaneous brushwork perfect for modern art lovers, creative spaces, and expressive gifts.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-pink-600 via-purple-700 to-orange-800 text-white px-6 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default WatercolorDreams;
