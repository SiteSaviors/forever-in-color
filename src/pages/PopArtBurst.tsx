
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PopArtBurstHero from "@/components/pop-art-burst/PopArtBurstHero";
import PopArtBurstGallery from "@/components/pop-art-burst/PopArtBurstGallery";
import PopArtBurstFeatures from "@/components/pop-art-burst/PopArtBurstFeatures";
import PopArtBurstHowItWorks from "@/components/pop-art-burst/PopArtBurstHowItWorks";
import PopArtBurstARPreview from "@/components/pop-art-burst/PopArtBurstARPreview";
import PopArtBurstTestimonials from "@/components/pop-art-burst/PopArtBurstTestimonials";

const PopArtBurst = () => {
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
    navigate("/product", { state: { preSelectedStyle: 9, styleName: "Pop Art Burst" } });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <PopArtBurstHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-gradient-to-b from-red-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            This style brings your image to life with comic book flair and Warhol-inspired punch. Expect bold outlines, vibrant color blocks, and halftone dot textures that turn your subject into a fun, retro masterpiece. It's playful, graphic, and full of personality — like a frame pulled straight from a vintage comic or pop art gallery.
          </p>
        </div>
      </section>

      <PopArtBurstFeatures />
      <PopArtBurstGallery />
      <PopArtBurstHowItWorks />
      <PopArtBurstARPreview />
      <PopArtBurstTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom pop art burst from photo, AI-generated comic book style, bold Warhol-inspired art, retro gift idea, Forever in Color Pop Art Burst style. Transform your memories into playful pop art with thick outlines, vibrant colors, and halftone textures perfect for fun spaces, retro gifts, and iconic displays.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white font-bold px-6 py-3 rounded-full shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PopArtBurst;
