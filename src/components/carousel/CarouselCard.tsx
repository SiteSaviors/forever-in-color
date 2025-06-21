
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
      // Center card - fully visible and prominent with soft glow
      return {
        transform: 'translateX(0) translateZ(0) scale(1) rotateY(0deg)',
        zIndex: 20,
        opacity: 1,
        filter: 'brightness(1) blur(0px) drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
      };
    } else if (absPosition === 1) {
      // Adjacent cards - slightly smaller and angled with 3D rotation
      const side = position > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 180}px) translateZ(-80px) scale(0.85) rotateY(${-side * 25}deg)`,
        zIndex: 15,
        opacity: 0.8,
        filter: 'brightness(0.85) blur(0.5px) drop-shadow(0 15px 30px rgba(0,0,0,0.1))',
      };
    } else if (absPosition === 2) {
      // Second-level cards - more pronounced 3D effect
      const side = position > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 320}px) translateZ(-160px) scale(0.7) rotateY(${-side * 40}deg)`,
        zIndex: 10,
        opacity: 0.6,
        filter: 'brightness(0.7) blur(1px) drop-shadow(0 10px 20px rgba(0,0,0,0.08))',
      };
    } else if (absPosition === 3) {
      // Third-level cards - deep 3D perspective with atmospheric fade
      const side = position > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 430}px) translateZ(-240px) scale(0.55) rotateY(${-side * 55}deg)`,
        zIndex: 5,
        opacity: 0.3,
        filter: 'brightness(0.55) blur(2px) drop-shadow(0 5px 15px rgba(0,0,0,0.05))',
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
      className="absolute w-48 h-[300px] cursor-pointer transition-all duration-700 ease-out transform-gpu"
      style={{
        ...cardStyle,
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center',
        left: '50%',
        top: '50%',
        marginLeft: '-96px',
        marginTop: '-150px',
      }}
      onClick={() => onClick(style)}
    >
      <div className={`w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden group transition-all duration-500 ${
        isCenter ? 'hover:shadow-3xl hover:scale-[1.02] ring-2 ring-purple-100/50' : ''
      }`}>
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={style.image}
            alt={style.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isCenter ? 'group-hover:scale-110' : ''
            }`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            isCenter ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
          }`} />
          
          {/* Hover overlay - only show on center card */}
          {isCenter && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 text-gray-900 font-semibold text-xs shadow-lg transform translate-y-2 group-hover:translate-y-0">
                Imagine your photo in this style
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 h-32 flex flex-col justify-between">
          <div>
            <h3 className={`font-bold text-gray-900 mb-2 transition-all duration-300 leading-tight ${
              isCenter ? 'text-base' : 'text-sm opacity-80'
            }`}>{style.name}</h3>
            <p className={`text-gray-600 text-xs mb-3 transition-all duration-300 leading-relaxed ${
              isCenter ? 'opacity-100 font-medium' : 'opacity-60'
            }`}>{style.description}</p>
          </div>
          
          {/* Only show button on center card */}
          {isCenter && (
            <Button 
              className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 transition-all duration-300 group/btn transform hover:scale-105 rounded-full font-semibold text-xs py-2"
              onClick={(e) => {
                e.stopPropagation();
                onClick(style);
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Try This Style
                <Sparkles className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 group-hover/btn:animate-pulse" />
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
