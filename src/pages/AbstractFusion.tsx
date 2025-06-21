
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AbstractFusionHero from "@/components/abstract-fusion/AbstractFusionHero";
import AbstractFusionGallery from "@/components/abstract-fusion/AbstractFusionGallery";
import AbstractFusionFeatures from "@/components/abstract-fusion/AbstractFusionFeatures";
import AbstractFusionTestimonials from "@/components/abstract-fusion/AbstractFusionTestimonials";
import AbstractFusionHowItWorks from "@/components/abstract-fusion/AbstractFusionHowItWorks";
import AbstractFusionARPreview from "@/components/abstract-fusion/AbstractFusionARPreview";

const AbstractFusion = () => {
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
    navigate("/product", { state: { preSelectedStyle: 13, styleName: "Abstract Fusion" } });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <AbstractFusionHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            Abstract Fusion blends multiple visual art styles—abstraction, surrealism, cubism, impressionism, and digital effects—into a single, cohesive masterpiece. With bold colors, energetic strokes, and layered textures, each piece emphasizes feeling, motion, and symbolism over traditional realism.
          </p>
        </div>
      </section>

      <AbstractFusionFeatures />
      <AbstractFusionGallery />
      <AbstractFusionHowItWorks />
      <AbstractFusionARPreview />
      <AbstractFusionTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Abstract Fusion art style, modern canvas art, multi-style blend artwork, contemporary wall art, dynamic visual composition, Forever in Color Abstract Fusion. Transform your photos into bold, expressive artwork that combines multiple artistic techniques for a truly unique and emotionally powerful piece.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-6 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AbstractFusion;
