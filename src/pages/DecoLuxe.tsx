
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
            Experience the timeless sophistication of modern Art Deco design. This refined style blends bold symmetry with metallic accents and geometric grace, bringing the elegance of the Great Gatsby era into the present. Perfect for creating luxurious portraits that embody structured beauty and contemporary glamour.
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
          Custom Art Deco portrait from photo, AI-generated luxury artwork, sophisticated geometric style, elegant gift idea, Forever in Color Deco Luxe style. Transform your precious memories into luxurious artwork with bold symmetry and metallic accents perfect for sophisticated portraits, refined spaces, and timeless gifts.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-gray-900 px-6 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
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
