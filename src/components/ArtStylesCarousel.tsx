
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

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artStyles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

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
    <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CarouselHeader />

        {/* 3D Carousel */}
        <div className="relative h-[500px] flex items-center justify-center perspective-1000">
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
