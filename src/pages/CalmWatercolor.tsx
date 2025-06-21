
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CalmWatercolorHero from "@/components/calm-watercolor/CalmWatercolorHero";
import CalmWatercolorGallery from "@/components/calm-watercolor/CalmWatercolorGallery";
import CalmWatercolorFeatures from "@/components/calm-watercolor/CalmWatercolorFeatures";
import CalmWatercolorHowItWorks from "@/components/calm-watercolor/CalmWatercolorHowItWorks";
import CalmWatercolorARPreview from "@/components/calm-watercolor/CalmWatercolorARPreview";
import CalmWatercolorTestimonials from "@/components/calm-watercolor/CalmWatercolorTestimonials";

const CalmWatercolor = () => {
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
    navigate("/product", { state: { preSelectedStyle: 3, styleName: "Calm WaterColor" } });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <CalmWatercolorHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            Inspired by the gentle art of watercolor painting, this style transforms your cherished moments with soft washes, subtle gradients, and delicate brushwork. Perfect for creating peaceful nursery art, serene family portraits, or tranquil memorial pieces that bring comfort and calm to any space.
          </p>
        </div>
      </section>

      <CalmWatercolorFeatures />
      <CalmWatercolorGallery />
      <CalmWatercolorHowItWorks />
      <CalmWatercolorARPreview />
      <CalmWatercolorTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom watercolor painting from photo, AI-generated soft art, delicate portrait style, peaceful gift idea, Forever in Color Calm Watercolor style. Transform your precious memories into serene artwork with gentle washes and soft brushstrokes perfect for nursery art, meditation spaces, and comfort gifts.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-blue-600 via-teal-700 to-green-800 text-white px-6 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CalmWatercolor;
