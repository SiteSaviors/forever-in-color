
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DecoLuxeHero from "@/components/deco-luxe/DecoLuxeHero";
import DecoLuxeGallery from "@/components/deco-luxe/DecoLuxeGallery";
import DecoLuxeFeatures from "@/components/deco-luxe/DecoLuxeFeatures";
import DecoLuxeHowItWorks from "@/components/deco-luxe/DecoLuxeHowItWorks";
import DecoLuxeARPreview from "@/components/deco-luxe/DecoLuxeARPreview";
import DecoLuxeTestimonials from "@/components/deco-luxe/DecoLuxeTestimonials";

const DecoLuxe = () => {
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
    navigate("/product", { state: { preSelectedStyle: 15, styleName: "Deco Luxe" } });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <DecoLuxeHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            Deco Luxe blends the rich elegance of Art Deco with sleek, modern design. Featuring bold symmetry, metallic accents, and geometric grace, this style brings timeless sophistication into the present. Think Great Gatsby meets modern editorial — structured yet soft, iconic yet current.
          </p>
        </div>
      </section>

      <DecoLuxeFeatures />
      <DecoLuxeGallery />
      <DecoLuxeHowItWorks />
      <DecoLuxeARPreview />
      <DecoLuxeTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom Deco Luxe art from photo, AI-generated Art Deco style, sophisticated geometric art, luxury gift idea, Forever in Color Deco Luxe style. Transform your precious memories into elegant artwork with bold symmetry, metallic accents, and geometric grace perfect for sophisticated portraits, wedding gifts, and high-end decor.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-amber-600 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DecoLuxe;
