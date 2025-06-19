
import { useState, useEffect } from "react";
import { artStyles } from "@/data/artStyles";
import { ArtStyle } from "@/types/artStyle";
import CarouselHeader from "@/components/carousel/CarouselHeader";
import CarouselCard from "@/components/carousel/CarouselCard";
import CarouselNavigation from "@/components/carousel/CarouselNavigation";
import StyleIndicators from "@/components/carousel/StyleIndicators";
import CarouselCTA from "@/components/carousel/CarouselCTA";

const ArtStylesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(7); // Start with middle item
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hasInitialRotated, setHasInitialRotated] = useState(false);

  // Initial auto-rotate on load to showcase interaction
  useEffect(() => {
    if (!hasInitialRotated) {
      const initialRotateTimeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % artStyles.length);
        setHasInitialRotated(true);
      }, 1500); // Wait 1.5s after load then rotate once

      return () => clearTimeout(initialRotateTimeout);
    }
  }, [hasInitialRotated]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !hasInitialRotated) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artStyles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, hasInitialRotated]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + artStyles.length) % artStyles.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % artStyles.length);
  };

  const handleStyleClick = (style: ArtStyle) => {
    // Navigate to product configurator
    window.location.href = '/product';
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Enhanced Background with Radial Gradient and Subtle Patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-white/40 via-purple-50/60 to-pink-100/80"></div>
        
        {/* Subtle cloud-like patterns */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-purple-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-32 right-20 w-80 h-80 bg-gradient-to-bl from-pink-100/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-1/3 w-64 h-64 bg-gradient-to-tl from-purple-100/25 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Content with enhanced backdrop */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CarouselHeader />

        {/* 3D Carousel with enhanced container shadow - increased height for taller cards */}
        <div className="relative h-[600px] flex items-center justify-center perspective-1000">
          {/* Subtle container shadow for grounding effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10 rounded-3xl blur-2xl transform translate-y-8 scale-110"></div>
          
          <div className="relative w-full h-full">
            {artStyles.map((style, index) => (
              <CarouselCard
                key={style.id}
                style={style}
                index={index}
                currentIndex={currentIndex}
                onClick={handleStyleClick}
              />
            ))}
          </div>

          <CarouselNavigation 
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>

        <StyleIndicators
          totalCount={artStyles.length}
          currentIndex={currentIndex}
          onIndicatorClick={handleIndicatorClick}
        />

        <CarouselCTA />
      </div>
    </section>
  );
};

export default ArtStylesCarousel;
