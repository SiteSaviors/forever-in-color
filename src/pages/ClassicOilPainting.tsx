
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClassicOilHero from "@/components/classic-oil/ClassicOilHero";
import ClassicOilGallery from "@/components/classic-oil/ClassicOilGallery";
import ClassicOilFeatures from "@/components/classic-oil/ClassicOilFeatures";
import ClassicOilTestimonials from "@/components/classic-oil/ClassicOilTestimonials";
import ClassicOilHowItWorks from "@/components/classic-oil/ClassicOilHowItWorks";
import ClassicOilARPreview from "@/components/classic-oil/ClassicOilARPreview";

const ClassicOilPainting = () => {
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
    navigate("/product", { state: { preSelectedStyle: 2, styleName: "Classic Oil Painting" } });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <ClassicOilHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            Inspired by traditional oil painting, this style brings depth, texture, and warmth to your most meaningful moments—whether it's a wedding portrait, a cherished pet, or a memorial tribute. Every brushstroke tells a story of love, legacy, and lasting memories.
          </p>
        </div>
      </section>

      <ClassicOilFeatures />
      <ClassicOilGallery />
      <ClassicOilHowItWorks />
      <ClassicOilARPreview />
      <ClassicOilTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom oil painting from photo, AI-generated canvas art, traditional portrait style, meaningful gift idea, Forever in Color Classic Oil Painting style. Transform your cherished memories into timeless museum-quality artwork with rich textures and warm tones perfect for memorial art, family heirlooms, and wedding gifts.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-amber-600 via-orange-700 to-red-800 text-white px-6 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ClassicOilPainting;
