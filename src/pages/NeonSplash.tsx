
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeonSplashHero from "@/components/neon-splash/NeonSplashHero";
import NeonSplashGallery from "@/components/neon-splash/NeonSplashGallery";
import NeonSplashFeatures from "@/components/neon-splash/NeonSplashFeatures";
import NeonSplashHowItWorks from "@/components/neon-splash/NeonSplashHowItWorks";
import NeonSplashARPreview from "@/components/neon-splash/NeonSplashARPreview";
import NeonSplashTestimonials from "@/components/neon-splash/NeonSplashTestimonials";

const NeonSplash = () => {
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
    navigate("/product", { state: { preSelectedStyle: 10, styleName: "Neon Splash" } });
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <NeonSplashHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-300 leading-relaxed">
            This style transforms your subject with vivid, high-contrast splashes of glowing neon color. Think abstract chaos meets electric joy — dynamic brushstrokes, glowing paint drips, and bold outlines pulse with movement. It's an energetic, eye-catching art style that feels alive, rebellious, and unforgettable.
          </p>
        </div>
      </section>

      <NeonSplashFeatures />
      <NeonSplashGallery />
      <NeonSplashHowItWorks />
      <NeonSplashARPreview />
      <NeonSplashTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom neon splash art from photo, AI-generated electric art, vibrant explosive style, bold gift idea, Forever in Color Neon Splash style. Transform your memories into electrifying artwork with glowing colors and dynamic energy perfect for modern spaces, rebellious gifts, and eye-catching displays.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-black font-bold px-6 py-3 rounded-full shadow-2xl hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-300 animate-pulse"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default NeonSplash;
