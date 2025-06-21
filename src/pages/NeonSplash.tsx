
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Neon Paint Splatter Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Large pink splatter - top left */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-radial from-pink-500/20 via-pink-500/10 to-transparent blur-xl"></div>
        
        {/* Purple splatter - top right */}
        <div className="absolute -top-10 right-10 w-80 h-80 rounded-full bg-gradient-radial from-purple-500/15 via-purple-500/8 to-transparent blur-lg transform rotate-45"></div>
        
        {/* Small cyan splatter - left middle */}
        <div className="absolute top-1/3 -left-10 w-48 h-48 rounded-full bg-gradient-radial from-cyan-400/25 via-cyan-400/12 to-transparent blur-md"></div>
        
        {/* Yellow splatter - bottom right */}
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-gradient-radial from-yellow-400/20 via-yellow-400/10 to-transparent blur-lg transform -rotate-12"></div>
        
        {/* Small pink drip - middle right */}
        <div className="absolute top-1/2 right-1/4 w-32 h-64 bg-gradient-to-b from-pink-500/15 to-transparent blur-sm transform rotate-12"></div>
        
        {/* Purple drip - left side */}
        <div className="absolute top-2/3 left-1/4 w-24 h-48 bg-gradient-to-b from-purple-500/20 to-transparent blur-sm transform -rotate-6"></div>
        
        {/* Scattered small splatters */}
        <div className="absolute top-1/4 left-1/3 w-16 h-16 rounded-full bg-gradient-radial from-cyan-400/30 to-transparent blur"></div>
        <div className="absolute top-3/4 left-2/3 w-20 h-20 rounded-full bg-gradient-radial from-pink-500/25 to-transparent blur"></div>
        <div className="absolute bottom-1/3 left-1/2 w-12 h-12 rounded-full bg-gradient-radial from-yellow-400/35 to-transparent blur-sm"></div>
        
        {/* Animated floating splatters */}
        <div className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full bg-pink-500/40 blur-sm animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 rounded-full bg-purple-500/30 blur animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/2 left-1/4 w-4 h-4 rounded-full bg-cyan-400/50 blur-sm animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content with higher z-index */}
      <div className="relative z-10">
        <Header />
        
        <NeonSplashHero onStartCreating={handleStartCreating} />

        {/* Emotional Description */}
        <section className="py-16 bg-black/80 backdrop-blur-sm">
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

        <Footer />
      </div>

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
    </div>
  );
};

export default NeonSplash;
