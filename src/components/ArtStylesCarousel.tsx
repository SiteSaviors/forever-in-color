
import { artStyles } from "@/data/artStyles";
import { ArtStyle } from "@/types/artStyle";
import CarouselHeader from "@/components/carousel/CarouselHeader";
import CarouselNavigation from "@/components/carousel/CarouselNavigation";
import StyleIndicators from "@/components/carousel/StyleIndicators";
import CarouselCTA from "@/components/carousel/CarouselCTA";
import CarouselBackground from "@/components/carousel/CarouselBackground";
import InfiniteCarouselContainer from "@/components/carousel/InfiniteCarouselContainer";
import { useCarouselParallax } from "@/hooks/useCarouselParallax";
import { useCarouselAutoplay } from "@/hooks/useCarouselAutoplay";

const ArtStylesCarousel = () => {
  const { sectionRef, parallaxOffset } = useCarouselParallax();
  const { currentIndex, handlePrevious, handleNext, handleIndicatorClick } = useCarouselAutoplay();

  const handleStyleClick = (style: ArtStyle) => {
    // Navigate to product configurator
    window.location.href = '/product';
  };

  return (
    <section ref={sectionRef} className="relative py-6 overflow-hidden">
      <CarouselBackground parallaxOffset={parallaxOffset} />

      {/* Content with enhanced backdrop and parallax */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          style={{
            transform: `translateY(${parallaxOffset.header}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <CarouselHeader />
        </div>

        {/* Infinite 3D Carousel with enhanced container shadow and parallax */}
        <div className="mt-2">
          <InfiniteCarouselContainer 
            currentIndex={currentIndex}
            parallaxOffset={parallaxOffset}
            onStyleClick={handleStyleClick}
          />
        </div>

        <CarouselNavigation 
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

        <div
          className="-mt-16"
          style={{
            transform: `translateY(${parallaxOffset.header * 0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <StyleIndicators
            totalCount={artStyles.length}
            currentIndex={currentIndex}
            onIndicatorClick={handleIndicatorClick}
          />

          <div className="mt-4">
            <CarouselCTA />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtStylesCarousel;
