
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";

interface CarouselNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
}

const CarouselNavigation = ({ onPrevious, onNext }: CarouselNavigationProps) => {
  return (
    <>
      <button
        onClick={onPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>
    </>
  );
};

export default CarouselNavigation;
