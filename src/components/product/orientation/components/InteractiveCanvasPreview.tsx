
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown } from "lucide-react";

interface InteractiveCanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
  isSelected: boolean;
  isRecommended?: boolean;
  onClick: () => void;
}

const InteractiveCanvasPreview = ({ 
  orientation, 
  userImageUrl, 
  isSelected, 
  isRecommended = false,
  onClick 
}: InteractiveCanvasPreviewProps) => {
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
      className={`relative cursor-pointer transition-all duration-500 group ${
        isSelected ? 'scale-105' : 'hover:scale-102'
      }`}
      onClick={onClick}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 shadow-lg">
            <Crown className="w-3 h-3 mr-1" />
            AI Recommended
          </Badge>
        </div>
      )}

      {/* Selection Glow */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl animate-pulse"></div>
      )}

      <AspectRatio ratio={getAspectRatio()} className="relative overflow-hidden rounded-xl">
        {/* Canvas Frame */}
        <img 
          src={canvasFrame}
          alt={`${orientation} canvas frame`}
          className="w-full h-full object-contain"
        />
        
        {/* User's Image Overlay */}
        {userImageUrl && (
          <div 
            className="absolute overflow-hidden transition-all duration-300 group-hover:brightness-110"
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
              className="w-full h-full object-cover"
              style={{
                filter: 'brightness(0.95) contrast(1.05)',
              }}
            />
          </div>
        )}

        {/* Premium Overlay Effects */}
        <div className={`absolute inset-0 border-2 rounded-xl transition-all duration-300 ${
          isSelected 
            ? 'border-purple-500 shadow-2xl shadow-purple-500/25' 
            : 'border-transparent group-hover:border-purple-300/50'
        }`}></div>

        {/* Shimmer Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </AspectRatio>

      {/* Premium Selection Indicator */}
      {isSelected && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
            <Sparkles className="w-3 h-3" />
            Selected
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCanvasPreview;
