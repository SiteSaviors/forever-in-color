
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThreeDStorybookHero from "@/components/three-d-storybook/ThreeDStorybookHero";
import ThreeDStorybookGallery from "@/components/three-d-storybook/ThreeDStorybookGallery";
import ThreeDStorybookFeatures from "@/components/three-d-storybook/ThreeDStorybookFeatures";
import ThreeDStorybookHowItWorks from "@/components/three-d-storybook/ThreeDStorybookHowItWorks";
import ThreeDStorybookARPreview from "@/components/three-d-storybook/ThreeDStorybookARPreview";
import ThreeDStorybookTestimonials from "@/components/three-d-storybook/ThreeDStorybookTestimonials";

const ThreeDStorybook = () => {
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
    navigate("/product", { state: { preSelectedStyle: 7, styleName: "3D Storybook" } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Header />
      
      <ThreeDStorybookHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
            This style transforms your subject into a vibrant 3D character with expressive features and a polished, animated look. Think big eyes, smooth curves, and joyful energy — like something out of a Pixar movie or Fortnite cinematic. It's cute, colorful, and full of charm, bringing out the most lovable version of your memory.
          </p>
        </div>
      </section>

      <ThreeDStorybookFeatures />
      <ThreeDStorybookGallery />
      <ThreeDStorybookHowItWorks />
      <ThreeDStorybookARPreview />
      <ThreeDStorybookTestimonials />

      {/* SEO Copy Block */}
      <div className="sr-only">
        <p>
          Custom 3D storybook art from photo, AI-generated Pixar style, animated character art, playful 3D rendering, Forever in Color 3D Storybook style. Transform your memories into adorable 3D characters with expressive features, vibrant colors, and joyful energy perfect for children's rooms, playful gifts, and animated displays.
        </p>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-full shadow-2xl shadow-pink-500/25 transform hover:scale-105 transition-all duration-300 animate-bounce"
          >
            Start Creating in This Style
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ThreeDStorybook;
