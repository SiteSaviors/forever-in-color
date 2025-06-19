
import { Button } from "@/components/ui/button";
import { ArtStyle } from "@/types/artStyle";

interface CarouselCardProps {
  style: ArtStyle;
  index: number;
  currentIndex: number;
  onClick: (style: ArtStyle) => void;
}

const CarouselCard = ({ style, index, currentIndex, onClick }: CarouselCardProps) => {
  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const absDistance = Math.abs(diff);
    
    if (absDistance === 0) {
      // Center card
      return {
        transform: 'translateX(0) scale(1) rotateY(0deg)',
        zIndex: 10,
        opacity: 1,
        filter: 'brightness(1)'
      };
    } else if (absDistance === 1) {
      // Adjacent cards
      const side = diff > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 300}px) scale(0.8) rotateY(${-side * 25}deg)`,
        zIndex: 5,
        opacity: 0.7,
        filter: 'brightness(0.7)'
      };
    } else if (absDistance === 2) {
      // Second-level cards
      const side = diff > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 450}px) scale(0.6) rotateY(${-side * 45}deg)`,
        zIndex: 2,
        opacity: 0.4,
        filter: 'brightness(0.5)'
      };
    } else {
      // Hidden cards
      return {
        transform: 'translateX(0) scale(0.4)',
        zIndex: 1,
        opacity: 0,
        filter: 'brightness(0.3)'
      };
    }
  };

  return (
    <div
      className="absolute left-1/2 top-1/2 w-80 h-96 cursor-pointer transition-all duration-700 ease-out transform-gpu"
      style={{
        ...getCardStyle(index),
        marginLeft: '-160px',
        marginTop: '-192px',
      }}
      onClick={() => onClick(style)}
    >
      <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-300">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={style.image}
            alt={style.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 text-gray-900 font-medium text-sm shadow-lg">
              Imagine your photo in this style
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{style.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{style.description}</p>
          
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            onClick={(e) => {
              e.stopPropagation();
              onClick(style);
            }}
          >
            Try This Style
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CarouselCard;
