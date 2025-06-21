
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
    navigate("/product", { state: { preSelectedStyle: 11, styleName: "Pop Art Burst" } });
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Comic Book Style Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Halftone dot patterns */}
        <div className="absolute top-10 left-10 w-32 h-32 opacity-10">
          <div className="grid grid-cols-8 gap-1 w-full h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="w-full h-full bg-red-500 rounded-full"></div>
            ))}
          </div>
        </div>
        
        <div className="absolute top-20 right-20 w-24 h-24 opacity-15">
          <div className="grid grid-cols-6 gap-1 w-full h-full">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="w-full h-full bg-blue-500 rounded-full"></div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-20 left-20 w-20 h-20 opacity-10">
          <div className="grid grid-cols-5 gap-1 w-full h-full">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="w-full h-full bg-yellow-500 rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Comic book burst shapes */}
        <div className="absolute top-1/3 right-1/4 w-48 h-48 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 transform rotate-12"
               style={{
                 clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
               }}>
          </div>
        </div>
        
        <div className="absolute bottom-1/3 left-1/3 w-32 h-32 opacity-8">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 transform -rotate-45"
               style={{
                 clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
               }}>
          </div>
        </div>
      </div>

      {/* Content with higher z-index */}
      <div className="relative z-10">
        <Header />
        
        <PopArtBurstHero onStartCreating={handleStartCreating} />

        {/* Emotional Description */}
        <section className="py-16 bg-gradient-to-r from-red-50 via-yellow-50 to-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xl text-gray-800 leading-relaxed font-medium">
              This style brings your image to life with comic book flair and Warhol-inspired punch. Expect bold outlines, vibrant color blocks, and halftone dot textures that turn your subject into a fun, retro masterpiece. It's playful, graphic, and full of personality — like a frame pulled straight from a vintage comic or pop art gallery.
            </p>
          </div>
        </section>

        <PopArtBurstFeatures />
        <PopArtBurstGallery />
        <PopArtBurstHowItWorks />
        <PopArtBurstARPreview />
        <PopArtBurstTestimonials />

        <Footer />
      </div>

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom pop art from photo, AI-generated comic book style, Warhol-inspired art, bold retro gift idea, Forever in Color Pop Art Burst style. Transform your memories into playful artwork with comic book outlines and halftone textures perfect for fun gifts, retro decor, and iconic pop art displays.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white font-bold px-6 py-3 rounded-full shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300 border-4 border-black"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}
    </div>
  );
};

export default PopArtBurst;
