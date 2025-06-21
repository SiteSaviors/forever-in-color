
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmbroideredMomentsHero from "@/components/embroidered-moments/EmbroideredMomentsHero";
import EmbroideredMomentsGallery from "@/components/embroidered-moments/EmbroideredMomentsGallery";
import EmbroideredMomentsFeatures from "@/components/embroidered-moments/EmbroideredMomentsFeatures";
import EmbroideredMomentsHowItWorks from "@/components/embroidered-moments/EmbroideredMomentsHowItWorks";
import EmbroideredMomentsARPreview from "@/components/embroidered-moments/EmbroideredMomentsARPreview";
import EmbroideredMomentsTestimonials from "@/components/embroidered-moments/EmbroideredMomentsTestimonials";

const EmbroideredMoments = () => {
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
    navigate("/product", { state: { preSelectedStyle: 14, styleName: "Embroidered Moments" } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Header />
      
      <EmbroideredMomentsHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-600 leading-relaxed">
            This style transforms your photo into the look of detailed, hand-sewn embroidery — complete with layered threads, soft textures, and fabric-inspired depth. It captures the cozy, handcrafted feel of a stitched portrait while keeping every detail of your memory beautifully intact. It's sentimental, timeless, and full of texture — like a modern heirloom made from thread and heart.
          </p>
        </div>
      </section>

      <EmbroideredMomentsFeatures />
      <EmbroideredMomentsGallery />
      <EmbroideredMomentsHowItWorks />
      <EmbroideredMomentsARPreview />
      <EmbroideredMomentsTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom embroidered art from photo, AI-generated textile style, hand-stitched charm, sentimental gift, Forever in Color Embroidered Moments style. Transform your memories into beautiful embroidered artwork with threaded textures and handcrafted warmth perfect for family portraits, baby gifts, and treasured keepsakes.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white font-bold px-6 py-3 rounded-full shadow-2xl hover:shadow-amber-500/25 transform hover:scale-105 transition-all duration-300 animate-pulse"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EmbroideredMoments;
