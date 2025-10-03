
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OriginalHero from "@/components/original/OriginalHero";
import OriginalGallery from "@/components/original/OriginalGallery";
import OriginalFeatures from "@/components/original/OriginalFeatures";
import OriginalTestimonials from "@/components/original/OriginalTestimonials";
import OriginalHowItWorks from "@/components/original/OriginalHowItWorks";
import OriginalARPreview from "@/components/original/OriginalARPreview";

const OriginalStyle = () => {
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
    navigate("/product", { state: { preSelectedStyle: 1, styleName: "Original Image" } });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <OriginalHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            Not every moment needs a brushstroke — sometimes, the photo says it all. Our Original Style offers your exact image, printed on premium canvas with crisp detail, vivid color, and timeless presence. Whether it's a candid smile, a cherished memory, or a perfect snapshot — we print it just as it is, beautifully preserved.
          </p>
        </div>
      </section>

      <OriginalFeatures />
      <OriginalGallery />
      <OriginalHowItWorks />
      <OriginalARPreview />
      <OriginalTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Original photo canvas print, premium photo preservation, crisp detail canvas, vivid color printing, Forever in Color Original Style. Transform your digital photos into stunning canvas prints with perfect clarity and vibrant colors, preserving your precious memories exactly as captured.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-gray-600 via-slate-700 to-zinc-800 text-white px-6 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OriginalStyle;
