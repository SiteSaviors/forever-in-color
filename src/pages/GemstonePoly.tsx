
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GemstonePolyHero from "@/components/gemstone-poly/GemstonePolyHero";
import GemstonePolyGallery from "@/components/gemstone-poly/GemstonePolyGallery";
import GemstonePolyFeatures from "@/components/gemstone-poly/GemstonePolyFeatures";
import GemstonePolyTestimonials from "@/components/gemstone-poly/GemstonePolyTestimonials";
import GemstonePolyHowItWorks from "@/components/gemstone-poly/GemstonePolyHowItWorks";
import GemstonePolyARPreview from "@/components/gemstone-poly/GemstonePolyARPreview";

const GemstonePoly = () => {
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
    navigate("/product", { state: { preSelectedStyle: 6, styleName: "Gemstone Poly" } });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <GemstonePolyHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            Gemstone Poly transforms your photo into a shimmering mosaic of angular color — like a memory sculpted from light and crystal. Inspired by gemstone facets and abstract geometry, this style blends sharp lines with soft gradients to create a bold, modern portrait that feels both artistic and emotionally vibrant.
          </p>
        </div>
      </section>

      <GemstonePolyFeatures />
      <GemstonePolyGallery />
      <GemstonePolyHowItWorks />
      <GemstonePolyARPreview />
      <GemstonePolyTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom gemstone poly art from photo, AI-generated geometric canvas art, modern polygonal portrait style, contemporary gift idea, Forever in Color Gemstone Poly style. Transform your cherished memories into stunning crystalline artwork with faceted geometry and prismatic colors perfect for modern decor, digital art lovers, and unique visual storytelling.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-purple-600 via-blue-700 to-cyan-800 text-white px-6 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GemstonePoly;
