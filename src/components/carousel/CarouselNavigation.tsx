
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
}

const CarouselNavigation = ({ onPrevious, onNext }: CarouselNavigationProps) => {
  return (
    <>
      <button
        onClick={onPrevious}
        className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/95 backdrop-blur-md hover:bg-white shadow-2xl rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-40 border-2 border-white/30 hover:border-purple-200/50"
        style={{ transform: 'translateY(-50%) translateZ(200px)' }}
      >
        <ChevronLeft className="w-7 h-7 text-gray-700" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/95 backdrop-blur-md hover:bg-white shadow-2xl rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-40 border-2 border-white/30 hover:border-purple-200/50"
        style={{ transform: 'translateY(-50%) translateZ(200px)' }}
      >
        <ChevronRight className="w-7 h-7 text-gray-700" />
      </button>
    </>
  );
};

export default CarouselNavigation;
