
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
        className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/90 backdrop-blur-md hover:bg-white shadow-2xl rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 border border-gray-200/50 hover:border-purple-300/70 hover:shadow-purple-500/25"
      >
        <ChevronLeft className="w-8 h-8 text-gray-700" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/90 backdrop-blur-md hover:bg-white shadow-2xl rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 border border-gray-200/50 hover:border-purple-300/70 hover:shadow-purple-500/25"
      >
        <ChevronRight className="w-8 h-8 text-gray-700" />
      </button>
    </>
  );
};

export default CarouselNavigation;
