import { useState, useEffect, useRef } from "react";
import { artStyles } from "@/data/artStyles";
import { ArtStyle } from "@/types/artStyle";
import CarouselHeader from "@/components/carousel/CarouselHeader";
import CarouselCard from "@/components/carousel/CarouselCard";
import CarouselNavigation from "@/components/carousel/CarouselNavigation";
import StyleIndicators from "@/components/carousel/StyleIndicators";
import CarouselCTA from "@/components/carousel/CarouselCTA";
import { useScrollParallax } from "@/hooks/useScrollParallax";

const ArtStylesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(7); // Start with middle item
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hasInitialRotated, setHasInitialRotated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollY = useScrollParallax();

  // Calculate parallax offsets based on scroll position
  const getParallaxOffset = () => {
    if (!sectionRef.current) return { background: 0, cards: 0, header: 0 };
    
    const rect = sectionRef.current.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const elementHeight = rect.height;
    const windowHeight = window.innerHeight;
    
    // Only apply parallax when element is in viewport
    if (rect.bottom < 0 || rect.top > windowHeight) {
      return { background: 0, cards: 0, header: 0 };
    }
    
    const scrollProgress = (scrollY - elementTop + windowHeight) / (elementHeight + windowHeight);
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
    
    return {
      background: (clampedProgress - 0.5) * 50, // Background moves slower
      cards: (clampedProgress - 0.5) * 25, // Cards move at medium speed
      header: (clampedProgress - 0.5) * 15, // Header moves slowest
    };
  };

  const parallax = getParallaxOffset();

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
    <section ref={sectionRef} className="relative py-12 overflow-hidden">
      {/* Enhanced Background with Parallax and Radial Gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
        style={{
          transform: `translateY(${parallax.background}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-white/40 via-purple-50/60 to-pink-100/80"></div>
        
        {/* Subtle cloud-like patterns with individual parallax speeds */}
        <div 
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-purple-100/30 to-transparent rounded-full blur-3xl"
          style={{
            transform: `translate(${parallax.background * 0.3}px, ${parallax.background * 0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        ></div>
        <div 
          className="absolute top-32 right-20 w-80 h-80 bg-gradient-to-bl from-pink-100/40 to-transparent rounded-full blur-3xl"
          style={{
            transform: `translate(${-parallax.background * 0.4}px, ${parallax.background * 0.3}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full blur-3xl"
          style={{
            transform: `translate(${parallax.background * 0.2}px, ${-parallax.background * 0.4}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        ></div>
        <div 
          className="absolute bottom-32 right-1/3 w-64 h-64 bg-gradient-to-tl from-purple-100/25 to-transparent rounded-full blur-3xl"
          style={{
            transform: `translate(${-parallax.background * 0.3}px, ${-parallax.background * 0.2}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        ></div>
      </div>

      {/* Content with enhanced backdrop and parallax */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          style={{
            transform: `translateY(${parallax.header}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <CarouselHeader />
        </div>

        {/* 3D Carousel with enhanced container shadow and parallax */}
        <div 
          className="relative h-[700px] flex items-center justify-center perspective-1000 -mt-12"
          style={{
            transform: `translateY(${parallax.cards}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
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

        <div
          className="-mt-4"
          style={{
            transform: `translateY(${parallax.header * 0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <StyleIndicators
            totalCount={artStyles.length}
            currentIndex={currentIndex}
            onIndicatorClick={handleIndicatorClick}
          />

          <CarouselCTA />
        </div>
      </div>
    </section>
  );
};

export default ArtStylesCarousel;
