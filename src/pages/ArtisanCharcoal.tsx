
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtisanCharcoalHero from "@/components/artisan-charcoal/ArtisanCharcoalHero";
import ArtisanCharcoalGallery from "@/components/artisan-charcoal/ArtisanCharcoalGallery";
import ArtisanCharcoalFeatures from "@/components/artisan-charcoal/ArtisanCharcoalFeatures";
import ArtisanCharcoalHowItWorks from "@/components/artisan-charcoal/ArtisanCharcoalHowItWorks";
import ArtisanCharcoalARPreview from "@/components/artisan-charcoal/ArtisanCharcoalARPreview";
import ArtisanCharcoalTestimonials from "@/components/artisan-charcoal/ArtisanCharcoalTestimonials";

const ArtisanCharcoal = () => {
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
    navigate("/product", { state: { preSelectedStyle: 8, styleName: "Artisan Charcoal" } });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <ArtisanCharcoalHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            Experience the timeless beauty of traditional charcoal artistry. This sophisticated style transforms your precious memories with rich, handcrafted detail using soft graphite strokes, natural shading, and expressive linework. Perfect for creating museum-quality portraits that capture quiet moments with bold, honest beauty.
          </p>
        </div>
      </section>

      <ArtisanCharcoalFeatures />
      <ArtisanCharcoalGallery />
      <ArtisanCharcoalHowItWorks />
      <ArtisanCharcoalARPreview />
      <ArtisanCharcoalTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom charcoal portrait from photo, AI-generated graphite art, hand-drawn sketch style, timeless gift idea, Forever in Color Artisan Charcoal style. Transform your cherished memories into elegant monochrome artwork with rich charcoal strokes and fine art detail perfect for memorial art, sophisticated spaces, and artistic gifts.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ArtisanCharcoal;
