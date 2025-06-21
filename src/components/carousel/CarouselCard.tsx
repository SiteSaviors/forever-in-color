
import { Button } from "@/components/ui/button";
import { ArtStyle } from "@/types/artStyle";
import { Sparkles } from "lucide-react";

interface CarouselCardProps {
  style: ArtStyle;
  position: number; // -3 to 3, where 0 is center
  onClick: (style: ArtStyle) => void;
}

const CarouselCard = ({ style, position, onClick }: CarouselCardProps) => {
  const getCardStyle = (position: number) => {
    const absPosition = Math.abs(position);
    
    if (position === 0) {
      // Center card - fully visible and prominent
      return {
        transform: 'translateX(0) translateZ(0) scale(1) rotateY(0deg)',
        zIndex: 20,
        opacity: 1,
        filter: 'brightness(1) blur(0px)',
      };
    } else if (absPosition === 1) {
      // Adjacent cards - slightly smaller and angled
      const side = position > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 280}px) translateZ(-100px) scale(0.85) rotateY(${-side * 35}deg)`,
        zIndex: 15,
        opacity: 0.8,
        filter: 'brightness(0.8) blur(0.5px)',
      };
    } else if (absPosition === 2) {
      // Second-level cards - smaller and more angled
      const side = position > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 480}px) translateZ(-200px) scale(0.7) rotateY(${-side * 50}deg)`,
        zIndex: 10,
        opacity: 0.6,
        filter: 'brightness(0.65) blur(1px)',
      };
    } else if (absPosition === 3) {
      // Third-level cards - very subtle background presence
      const side = position > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 650}px) translateZ(-300px) scale(0.55) rotateY(${-side * 65}deg)`,
        zIndex: 5,
        opacity: 0.4,
        filter: 'brightness(0.5) blur(2px)',
      };
    } else {
      // Cards beyond visible range - completely hidden
      return {
        transform: 'translateX(0) translateZ(-400px) scale(0.3)',
        zIndex: 1,
        opacity: 0,
        filter: 'brightness(0.3) blur(3px)',
      };
    }
  };

  const cardStyle = getCardStyle(position);
  const isCenter = position === 0;
  const isVisible = Math.abs(position) <= 3;

  if (!isVisible) return null;

  return (
    <div
      className="absolute left-1/2 top-1/2 w-80 h-[480px] cursor-pointer transition-all duration-700 ease-out transform-gpu"
      style={{
        ...cardStyle,
        marginLeft: '-160px',
        marginTop: '-240px',
        transformStyle: 'preserve-3d',
      }}
      onClick={() => onClick(style)}
    >
      <div className={`w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden group transition-all duration-300 ${
        isCenter ? 'hover:shadow-3xl hover:scale-[1.02]' : ''
      }`}>
        {/* Image */}
        <div className="relative h-72 overflow-hidden">
          <img
            src={style.image}
            alt={style.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isCenter ? 'group-hover:scale-110' : ''
            }`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            isCenter ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
          }`} />
          
          {/* Hover overlay - only show on center card */}
          {isCenter && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 text-gray-900 font-medium text-sm shadow-lg">
                Imagine your photo in this style
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 h-48 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{style.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{style.description}</p>
          </div>
          
          {/* Only show button on center card */}
          {isCenter && (
            <Button 
              className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 transition-all duration-300 group/btn"
              onClick={(e) => {
                e.stopPropagation();
                onClick(style);
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Try This Style
                <Sparkles className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 group-hover/btn:animate-pulse" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarouselCard;
