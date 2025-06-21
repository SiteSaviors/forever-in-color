
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ElectricBloomHero from "@/components/electric-bloom/ElectricBloomHero";
import ElectricBloomGallery from "@/components/electric-bloom/ElectricBloomGallery";
import ElectricBloomFeatures from "@/components/electric-bloom/ElectricBloomFeatures";
import ElectricBloomHowItWorks from "@/components/electric-bloom/ElectricBloomHowItWorks";
import ElectricBloomARPreview from "@/components/electric-bloom/ElectricBloomARPreview";
import ElectricBloomTestimonials from "@/components/electric-bloom/ElectricBloomTestimonials";

const ElectricBloom = () => {
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
    navigate("/product", { state: { preSelectedStyle: 11, styleName: "Electric Bloom" } });
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <ElectricBloomHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-300 leading-relaxed">
            This style surrounds your subject in a luminous neon aura — with glowing edges, pulsing highlights, and intense contrast. Think late-night city lights or futuristic poster vibes. Every detail is electrified with bold color and radiant lighting, turning your image into a glowing, high-impact visual experience.
          </p>
        </div>
      </section>

      <ElectricBloomFeatures />
      <ElectricBloomGallery />
      <ElectricBloomHowItWorks />
      <ElectricBloomARPreview />
      <ElectricBloomTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom electric bloom art from photo, AI-generated neon aura style, futuristic cyberpunk art, cinematic glow effect, Forever in Color Electric Bloom style. Transform your memories into electrifying artwork with luminous neon edges, radiant lighting, and high-voltage energy perfect for modern spaces, dramatic gifts, and futuristic displays.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-black font-bold px-6 py-3 rounded-full shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 animate-pulse"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ElectricBloom;
