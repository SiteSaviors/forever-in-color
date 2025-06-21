
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
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <ElectricBloomHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-slate-300 leading-relaxed">
            This style surrounds your subject in a luminous electric aura — with glowing edges, pulsing highlights, and intense contrast. Think late-night city lights or futuristic poster vibes. Every detail is electrified with bold color and radiant lighting, turning your image into a glowing, high-impact visual experience.
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
          Custom electric bloom art from photo, AI-generated electric aura style, futuristic cyberpunk art, cinematic glow effect, Forever in Color Electric Bloom style. Transform your memories into electrifying artwork with luminous electric edges, radiant lighting, and high-voltage energy perfect for modern spaces, dramatic gifts, and futuristic displays.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-full shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
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
