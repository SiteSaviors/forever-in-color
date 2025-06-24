
import { useState, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import PremiumMaterialTextures from "./PremiumMaterialTextures";

interface MorphingCanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
  size: string;
  isSelected: boolean;
  isRecommended?: boolean;
  onClick: () => void;
}

const MorphingCanvasPreview = ({ 
  orientation, 
  userImageUrl, 
  size,
  isSelected, 
  isRecommended = false,
  onClick 
}: MorphingCanvasPreviewProps) => {
  const [morphing, setMorphing] = useState(false);
  const [prevOrientation, setPrevOrientation] = useState(orientation);

  useEffect(() => {
    if (prevOrientation !== orientation) {
      setMorphing(true);
      setTimeout(() => {
        setPrevOrientation(orientation);
        setMorphing(false);
      }, 300);
    }
  }, [orientation, prevOrientation]);

  const getCanvasFrame = () => {
    switch (orientation) {
      case 'horizontal':
        return '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png';
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
      default:
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
    }
  };

  const getImagePosition = () => {
    switch (orientation) {
      case 'horizontal':
        return { top: '18%', left: '15%', width: '70%', height: '64%' };
      case 'vertical':
        return { top: '15%', left: '20%', width: '60%', height: '70%' };
      case 'square':
        return { top: '5.2%', left: '4.7%', width: '89.3%', height: '89.3%' };
      default:
        return { top: '5.2%', left: '4.7%', width: '89.3%', height: '89.3%' };
    }
  };

  const getAspectRatio = () => {
    switch (orientation) {
      case 'horizontal': return 4/3;
      case 'vertical': return 3/4;
      case 'square': return 1;
      default: return 1;
    }
  };

  const canvasFrame = getCanvasFrame();
  const imagePosition = getImagePosition();

  return (
    <div 
      className={`relative cursor-pointer group ${
        isSelected ? 'scale-105' : 'hover:scale-102'
      } transition-all duration-500`}
      onClick={onClick}
    >
      {/* Recommended Badge with Glass Effect */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
          <Badge className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white px-3 py-1 shadow-2xl backdrop-blur-sm border border-white/20">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Recommended
          </Badge>
        </div>
      )}

      {/* Morphing Container */}
      <div className={`transition-all duration-300 ${morphing ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
        <AspectRatio ratio={getAspectRatio()} className="relative overflow-hidden rounded-xl">
          {/* Premium Material Textures */}
          <PremiumMaterialTextures
            orientation={orientation}
            size={size}
            isSelected={isSelected}
            className="absolute inset-0"
          />

          {/* Canvas Frame with Glass Effect */}
          <div className="relative w-full h-full">
            <img 
              src={canvasFrame}
              alt={`${orientation} canvas frame`}
              className="w-full h-full object-contain relative z-10"
            />
            
            {/* Glass Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60 rounded-xl z-20 pointer-events-none" />
          </div>
          
          {/* User's Image with Enhanced Effects */}
          {userImageUrl && (
            <div 
              className="absolute overflow-hidden transition-all duration-500 group-hover:brightness-110 z-15"
              style={{
                top: imagePosition.top,
                left: imagePosition.left,
                width: imagePosition.width,
                height: imagePosition.height,
              }}
            >
              <img 
                src={userImageUrl}
                alt="Preview"
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                style={{
                  filter: 'brightness(0.95) contrast(1.05) saturate(1.1)',
                }}
              />
              
              {/* Image Glass Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10 pointer-events-none" />
            </div>
          )}

          {/* Premium Border Effect */}
          <div className={`absolute inset-0 border-2 rounded-xl transition-all duration-500 ${
            isSelected 
              ? 'border-gradient-to-r from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/30' 
              : 'border-transparent group-hover:border-purple-300/50'
          }`} />

          {/* Holographic Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-30" />
        </AspectRatio>
      </div>

      {/* Premium Selection Indicator with Floating Animation */}
      {isSelected && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-2xl backdrop-blur-sm border border-white/20">
            <Sparkles className="w-3 h-3" />
            Selected
          </div>
        </div>
      )}

      {/* Floating Particles Effect */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MorphingCanvasPreview;
