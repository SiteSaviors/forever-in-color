
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CanvasMockupProps {
  imageUrl: string;
  selectedSize: string;
  selectedOrientation: string;
  customizations: {
    floatingFrame: {
      enabled: boolean;
      color: 'white' | 'black' | 'espresso';
    };
  };
}

const CanvasMockup = ({ imageUrl, selectedSize, selectedOrientation, customizations }: CanvasMockupProps) => {
  // Calculate aspect ratio based on orientation
  const getAspectRatio = () => {
    if (selectedOrientation === 'square') return 1;
    if (selectedOrientation === 'horizontal') return 4/3;
    if (selectedOrientation === 'vertical') return 3/4;
    return 1; // fallback
  };

  // Get frame colors
  const getFrameColor = () => {
    if (!customizations.floatingFrame.enabled) return '';
    switch (customizations.floatingFrame.color) {
      case 'white': return 'bg-white border-gray-200';
      case 'black': return 'bg-black border-gray-800';
      case 'espresso': return 'bg-amber-900 border-amber-800';
      default: return 'bg-white border-gray-200';
    }
  };

  const aspectRatio = getAspectRatio();
  const frameClass = getFrameColor();

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12">
      {/* Room Environment Suggestion */}
      <div className="relative">
        {/* Canvas with optional floating frame */}
        <div className={`
          relative shadow-2xl transition-all duration-300 hover:shadow-3xl
          ${customizations.floatingFrame.enabled 
            ? `p-6 md:p-8 border-2 ${frameClass} rounded-lg` 
            : 'rounded-lg overflow-hidden'
          }
        `}>
          <AspectRatio ratio={aspectRatio} className="w-64 md:w-80 lg:w-96">
            <img 
              src={imageUrl} 
              alt="Canvas preview" 
              className="w-full h-full object-cover rounded-md"
            />
          </AspectRatio>
          
          {/* Size indicator */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-600 shadow-lg">
              {selectedSize} • {selectedOrientation}
            </div>
          </div>
        </div>

        {/* Subtle shadow beneath for realism */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-4 bg-gray-300/30 blur-md rounded-full"></div>
      </div>
    </div>
  );
};

export default CanvasMockup;
