
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Check, CheckCircle } from "lucide-react";
import { useStylePreview } from "./hooks/useStylePreview";
import StyleCardLoadingOverlay from "./components/StyleCardLoadingOverlay";
import StyleCardIndicators from "./components/StyleCardIndicators";

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
  cropAspectRatio?: number;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
}

const StyleCard = ({
  style,
  croppedImage,
  selectedStyle,
  isPopular,
  cropAspectRatio = 1,
  onStyleClick
}: StyleCardProps) => {
  const { 
    isLoading, 
    previewUrl, 
    hasGeneratedPreview, 
    handleClick,
    isStyleGenerated 
  } = useStylePreview({
    style,
    croppedImage,
    isPopular,
    onStyleClick
  });

  const isSelected = selectedStyle === style.id;
  const showLoadingState = isLoading;
  const showGeneratedBadge = isStyleGenerated && style.id !== 1;

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
      } ${showGeneratedBadge ? 'opacity-75' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Preview Area */}
        <AspectRatio ratio={cropAspectRatio} className="relative overflow-hidden rounded-t-lg">
          {/* Canvas Frame Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 p-2">
            <div className="w-full h-full bg-white border border-gray-300 shadow-inner rounded-sm overflow-hidden">
              {/* Image Content */}
              {previewUrl || croppedImage ? (
                <img 
                  src={previewUrl || croppedImage || ''} 
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                // Placeholder with style preview
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <img 
                    src={style.image} 
                    alt={style.name}
                    className="w-12 h-12 opacity-40"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Loading Overlay */}
          {showLoadingState && <StyleCardLoadingOverlay styleName={style.name} />}
          
          {/* Popular Badge */}
          {isPopular && !showGeneratedBadge && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold">
                Popular
              </Badge>
            </div>
          )}

          {/* Already Generated Badge */}
          {showGeneratedBadge && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-gray-100/90 text-gray-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Generated
              </Badge>
            </div>
          )}
          
          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute top-3 left-3">
              <div className="bg-purple-600 text-white rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Canvas shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
        </AspectRatio>

        {/* Style Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-gray-900 text-sm">{style.name}</h5>
            <StyleCardIndicators 
              hasGeneratedPreview={hasGeneratedPreview}
              isPopular={isPopular}
              isSelected={isSelected}
              isStyleGenerated={showGeneratedBadge}
            />
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{style.description}</p>
          
          {/* Already Generated Message */}
          {showGeneratedBadge && style.id !== 1 && (
            <p className="text-xs text-gray-500 italic">
              Refresh page to generate again
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleCard;
