
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
      // Center card - full size and prominence
      return {
        transform: 'translateX(0) translateZ(100px) scale(1.05) rotateY(0deg)',
        zIndex: 30,
        opacity: 1,
        filter: 'brightness(1.1) blur(0px) drop-shadow(0 25px 50px rgba(147,51,234,0.3))',
      };
    } else if (absPosition === 1) {
      // Adjacent cards - rotated and scaled down
      const side = position > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 280}px) translateZ(-50px) scale(0.85) rotateY(${-side * 25}deg)`,
        zIndex: 25,
        opacity: 0.8,
        filter: 'brightness(0.9) blur(0.5px) drop-shadow(0 20px 40px rgba(0,0,0,0.2))',
      };
    } else if (absPosition === 2) {
      // Second-level cards - more rotation and smaller
      const side = position > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 450}px) translateZ(-150px) scale(0.65) rotateY(${-side * 45}deg)`,
        zIndex: 20,
        opacity: 0.6,
        filter: 'brightness(0.75) blur(1px) drop-shadow(0 15px 30px rgba(0,0,0,0.15))',
      };
    } else if (absPosition === 3) {
      // Third-level cards - dramatic depth
      const side = position > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 580}px) translateZ(-250px) scale(0.5) rotateY(${-side * 60}deg)`,
        zIndex: 15,
        opacity: 0.35,
        filter: 'brightness(0.6) blur(2px) drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
      };
    } else {
      // Cards beyond visible range
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
      className="absolute w-64 h-[380px] cursor-pointer transition-all duration-700 ease-out"
      style={{
        ...cardStyle,
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center',
        left: '50%',
        top: '50%',
        marginLeft: '-128px',
        marginTop: '-190px',
        willChange: 'transform',
      }}
      onClick={() => onClick(style)}
    >
      <div className={`w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden group transition-all duration-500 ${
        isCenter ? 'hover:shadow-[0_0_80px_rgba(147,51,234,0.4)] hover:scale-[1.02] ring-4 ring-purple-200/30' : ''
      }`}>
        {/* Image */}
        <div className="relative h-60 overflow-hidden">
          <img
            src={style.image}
            alt={style.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isCenter ? 'group-hover:scale-110' : ''
            }`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
            isCenter ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
          }`} />
          
          {/* Hover overlay - enhanced for center card */}
          {isCenter && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 text-gray-900 font-bold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 border-2 border-purple-200">
                ✨ Transform Your Photo
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 h-32 flex flex-col justify-between">
          <div>
            <h3 className={`font-bold text-gray-900 mb-1 transition-all duration-300 leading-tight ${
              isCenter ? 'text-xl' : 'text-lg opacity-80'
            }`}>{style.name}</h3>
            <p className={`text-gray-600 text-sm mb-3 transition-all duration-300 leading-relaxed ${
              isCenter ? 'opacity-100 font-medium' : 'opacity-60'
            }`}>{style.description}</p>
          </div>
          
          {/* Enhanced button - only show on center card */}
          {isCenter && (
            <Button 
              className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white border-0 transition-all duration-300 group/btn transform hover:scale-105 rounded-xl font-bold text-sm py-3 shadow-lg hover:shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                onClick(style);
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Try This Style
                <Sparkles className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 group-hover/btn:animate-pulse" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarouselCard;
