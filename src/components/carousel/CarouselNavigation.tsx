
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
        className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-white shadow-xl rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-30 border border-white/20"
        style={{ transform: 'translateY(-50%)' }}
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-white shadow-xl rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-30 border border-white/20"
        style={{ transform: 'translateY(-50%)' }}
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>
    </>
  );
};

export default CarouselNavigation;
