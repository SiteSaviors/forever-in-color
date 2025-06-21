
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GemstonePolyHero from "@/components/gemstone-poly/GemstonePolyHero";
import GemstonePolyFeatures from "@/components/gemstone-poly/GemstonePolyFeatures";
import GemstonePolyGallery from "@/components/gemstone-poly/GemstonePolyGallery";
import GemstonePolyHowItWorks from "@/components/gemstone-poly/GemstonePolyHowItWorks";
import GemstonePolyARPreview from "@/components/gemstone-poly/GemstonePolyARPreview";
import GemstonePolyTestimonials from "@/components/gemstone-poly/GemstonePolyTestimonials";

const GemstonePoly = () => {
  const navigate = useNavigate();

  const handleStartCreating = () => {
    navigate("/product", { 
      state: { 
        preSelectedStyle: 6,
        styleName: "Gemstone Poly"
      } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <GemstonePolyHero onStartCreating={handleStartCreating} />
      <GemstonePolyFeatures />
      <GemstonePolyGallery />
      <GemstonePolyHowItWorks />
      <GemstonePolyARPreview />
      <GemstonePolyTestimonials />
      <Footer />
    </div>
  );
};

export default GemstonePoly;
