
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
  const { isLoading, previewUrl, hasGeneratedPreview, handleClick } = useStylePreview({
    style,
    croppedImage,
    isPopular,
    onStyleClick
  });

  const isSelected = selectedStyle === style.id;
  const canPreview = croppedImage && (isPopular || hasGeneratedPreview || isSelected);
  const isLocked = !croppedImage && !isPopular;

  // Determine which image to show in preview
  const getPreviewImage = () => {
    if (canPreview) {
      // For popular styles or generated previews, show the user's image
      if (isPopular || hasGeneratedPreview) {
        return previewUrl || croppedImage;
      }
    }
    // Default to style example image
    return style.image;
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
      } ${hasGeneratedPreview && !isSelected ? 'ring-2 ring-green-500' : ''} ${
        isLocked ? 'opacity-75' : ''
      } ${isLoading ? 'pointer-events-none' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <AspectRatio ratio={cropAspectRatio} className="relative overflow-hidden rounded-t-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 p-2">
            <div className="w-full h-full bg-white rounded-sm shadow-inner relative overflow-hidden">
              <div className="absolute inset-0">
                <img 
                  src={getPreviewImage()!} 
                  alt={canPreview ? "Style preview" : style.name} 
                  className="w-full h-full object-cover"
                />
                
                <StyleCardIndicators
                  isPopular={isPopular}
                  isLoading={isLoading}
                  hasGeneratedPreview={hasGeneratedPreview}
                  isSelected={isSelected}
                  isLocked={isLocked}
                />
              </div>

              {/* Loading Overlay */}
              {isLoading && <StyleCardLoadingOverlay />}
            </div>
          </div>
          
          <StyleCardIndicators
            isPopular={isPopular}
            isLoading={isLoading}
            hasGeneratedPreview={hasGeneratedPreview}
            isSelected={isSelected}
            isLocked={false}
          />
        </AspectRatio>

        <div className="p-3 space-y-2">
          <h5 className="font-semibold text-gray-900 text-sm">{style.name}</h5>
          <p className="text-xs text-gray-600 leading-relaxed">{style.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleCard;
