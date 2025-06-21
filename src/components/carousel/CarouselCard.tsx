
import { Button } from "@/components/ui/button";
import { ArtStyle } from "@/types/artStyle";
import { Sparkles } from "lucide-react";

interface CarouselCardProps {
  style: ArtStyle;
  position: number; // -2 to 2, where 0 is center
  onClick: (style: ArtStyle) => void;
}

const CarouselCard = ({ style, position, onClick }: CarouselCardProps) => {
  const getCardStyle = (position: number) => {
    // Calculate circular positioning like in the reference image
    const angle = position * 35; // 35 degrees between each card
    const radius = 350; // Distance from center
    const depth = Math.abs(position) * 80; // Depth based on distance from center
    
    if (position === 0) {
      // Center card - prominent and straight
      return {
        transform: 'translateX(0) translateZ(150px) scale(1) rotateY(0deg)',
        zIndex: 30,
        opacity: 1,
        filter: 'brightness(1) blur(0px)',
      };
    } else if (Math.abs(position) === 1) {
      // Adjacent cards - angled with proper circular positioning
      const side = position > 0 ? 1 : -1;
      const x = Math.sin((angle * Math.PI) / 180) * radius;
      const z = Math.cos((angle * Math.PI) / 180) * radius;
      
      return {
        transform: `translateX(${x}px) translateZ(${z}px) scale(0.8) rotateY(${-angle}deg)`,
        zIndex: 25,
        opacity: 0.9,
        filter: 'brightness(0.95) blur(0px)',
      };
    } else {
      // Outer cards - more angled with deeper circular positioning
      const side = position > 0 ? 1 : -1;
      const x = Math.sin((angle * Math.PI) / 180) * radius;
      const z = Math.cos((angle * Math.PI) / 180) * radius;
      
      return {
        transform: `translateX(${x}px) translateZ(${z}px) scale(0.65) rotateY(${-angle}deg)`,
        zIndex: 20,
        opacity: 0.8,
        filter: 'brightness(0.9) blur(0.5px)',
      };
    }
  };

  const cardStyle = getCardStyle(position);
  const isCenter = position === 0;

  return (
    <div
      className="absolute left-1/2 top-1/2 w-80 h-[480px] cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] transform-gpu"
      style={{
        ...cardStyle,
        marginLeft: '-160px',
        marginTop: '-240px',
        transformStyle: 'preserve-3d',
      }}
      onClick={() => onClick(style)}
    >
      <div className={`w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden group transition-all duration-500 ${
        isCenter ? 'hover:shadow-3xl hover:scale-[1.02]' : ''
      }`}>
        {/* Image */}
        <div className="relative h-72 overflow-hidden">
          <img
            src={style.image}
            alt={style.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isCenter ? 'group-hover:scale-110' : ''
            }`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500 ${
            isCenter ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
          }`} />
          
          {/* Hover overlay - only show on center card */}
          {isCenter && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
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
              className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 transition-all duration-500 group/btn"
              onClick={(e) => {
                e.stopPropagation();
                onClick(style);
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Try This Style
                <Sparkles className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-all duration-500 group-hover/btn:animate-pulse" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarouselCard;
