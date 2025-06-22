
import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface StyleCardProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  isPopular: boolean;
  cropAspectRatio?: number; // New prop for dynamic aspect ratio
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
}

const StyleCard = ({ 
  style, 
  croppedImage, 
  selectedStyle, 
  isPopular,
  cropAspectRatio = 1, // Default to square
  onStyleClick 
}: StyleCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const isSelected = selectedStyle === style.id;
  const canPreview = croppedImage && (isPopular || isLoading || isSelected);
  const isLocked = !croppedImage && !isPopular;

  const handleClick = async () => {
    if (!croppedImage) return;

    // If it's a popular style, it should already be available
    if (isPopular) {
      onStyleClick(style);
      return;
    }

    // For other styles, simulate loading
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      onStyleClick(style);
    }, 1500);
  };

  const getStyleGradient = (styleId: number) => {
    const gradients: { [key: number]: string } = {
      1: 'linear-gradient(to bottom right, #6b7280, #374151, #111827)',
      4: 'linear-gradient(to bottom right, #93c5fd, #c4b5fd, #f9a8d4)',
      5: 'linear-gradient(to bottom right, #fbbf24, #f59e0b, #f97316)',
      2: 'linear-gradient(to bottom right, #d97706, #ea580c, #dc2626)',
      10: 'linear-gradient(to bottom right, #a3e635, #ec4899, #a855f7)',
      7: 'linear-gradient(to bottom right, #a855f7, #ec4899, #ef4444)',
      9: 'linear-gradient(to bottom right, #ef4444, #fbbf24, #3b82f6)',
      11: 'linear-gradient(to bottom right, #ec4899, #a855f7, #06b6d4)',
      8: 'linear-gradient(to bottom right, #6b7280, #374151, #000000)',
      15: 'linear-gradient(to bottom right, #f59e0b, #d97706, #ea580c)'
    };
    return gradients[styleId] || 'linear-gradient(to bottom right, #6b7280, #374151)';
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
      } ${isLocked ? 'opacity-75' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Dynamic Aspect Ratio Preview with Canvas Mockup Effect */}
        <AspectRatio ratio={cropAspectRatio} className="relative overflow-hidden rounded-t-lg">
          {/* Canvas Frame Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 p-2">
            <div className="w-full h-full bg-white rounded-sm shadow-inner relative overflow-hidden">
              {canPreview ? (
                <div className="absolute inset-0">
                  <img 
                    src={croppedImage!} 
                    alt="Style preview" 
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0 bg-gradient-to-br opacity-60 mix-blend-overlay" 
                    style={{ background: getStyleGradient(style.id) }}
                  />
                  
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center space-y-2">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs font-medium">Creating preview...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0">
                  <img 
                    src={style.image} 
                    alt={style.name} 
                    className="w-full h-full object-cover"
                  />
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-white text-center space-y-2 px-4">
                        <Lock className="w-6 h-6 mx-auto" />
                        <p className="text-xs font-medium leading-tight">Upload Your Photo to preview this style</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isPopular && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold text-xs">
                Popular
              </Badge>
            </div>
          )}
          
          {isSelected && !isLoading && (
            <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center z-10">
              <div className="bg-purple-600 text-white rounded-full p-2">
                <Check className="w-4 h-4" />
              </div>
            </div>
          )}
        </AspectRatio>

        {/* Style Info */}
        <div className="p-3 space-y-2">
          <h5 className="font-semibold text-gray-900 text-sm">{style.name}</h5>
          <p className="text-xs text-gray-600 leading-relaxed">{style.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleCard;
