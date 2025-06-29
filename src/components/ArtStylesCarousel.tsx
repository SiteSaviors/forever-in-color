
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { artStyles } from "@/data/artStyles";

const ArtStylesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % artStyles.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + artStyles.length) % artStyles.length);
  };

  return (
    <div className="relative overflow-hidden">
      <div 
        ref={carouselRef}
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {artStyles.map((_, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ArtStylesCarousel;
