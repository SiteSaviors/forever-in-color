
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PastelBlissHero from "@/components/pastel-bliss/PastelBlissHero";
import PastelBlissGallery from "@/components/pastel-bliss/PastelBlissGallery";
import PastelBlissFeatures from "@/components/pastel-bliss/PastelBlissFeatures";
import PastelBlissHowItWorks from "@/components/pastel-bliss/PastelBlissHowItWorks";
import PastelBlissARPreview from "@/components/pastel-bliss/PastelBlissARPreview";
import PastelBlissTestimonials from "@/components/pastel-bliss/PastelBlissTestimonials";

const PastelBliss = () => {
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
    navigate("/product", { state: { preSelectedStyle: 5, styleName: "Pastel Bliss" } });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <PastelBlissHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            Experience the gentle beauty of realistic pastel artistry. This refined style captures every subtle detail with smooth blending, lifelike textures, and soft natural tones. Perfect for creating sophisticated portraits that highlight the delicate beauty of skin, fabric, and light with museum-quality precision.
          </p>
        </div>
      </section>

      <PastelBlissFeatures />
      <PastelBlissGallery />
      <PastelBlissHowItWorks />
      <PastelBlissARPreview />
      <PastelBlissTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom pastel portrait from photo, AI-generated realistic art, soft detailed style, sophisticated gift idea, Forever in Color Pastel Bliss style. Transform your precious memories into lifelike artwork with smooth blending and gentle highlights perfect for elegant portraits, refined spaces, and timeless gifts.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 text-gray-800 px-6 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PastelBliss;
