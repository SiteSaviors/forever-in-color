
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtisticMashupHero from "@/components/artistic-mashup/ArtisticMashupHero";
import ArtisticMashupFeatures from "@/components/artistic-mashup/ArtisticMashupFeatures";
import ArtisticMashupGallery from "@/components/artistic-mashup/ArtisticMashupGallery";
import ArtisticMashupHowItWorks from "@/components/artistic-mashup/ArtisticMashupHowItWorks";
import ArtisticMashupARPreview from "@/components/artistic-mashup/ArtisticMashupARPreview";
import ArtisticMashupTestimonials from "@/components/artistic-mashup/ArtisticMashupTestimonials";

const ArtisticMashup = () => {
  const navigate = useNavigate();

  const handleStartCreating = () => {
    navigate("/product", { 
      state: { 
        preSelectedStyle: { 
          id: 12, 
          name: "Artistic Mashup" 
        } 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ArtisticMashupHero onStartCreating={handleStartCreating} />
      <ArtisticMashupFeatures />
      <ArtisticMashupGallery />
      <ArtisticMashupHowItWorks />
      <ArtisticMashupARPreview />
      <ArtisticMashupTestimonials />
      <Footer />
    </div>
  );
};

export default ArtisticMashup;
