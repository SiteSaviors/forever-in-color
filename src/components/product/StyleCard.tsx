
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { ArtStyle } from "@/types/artStyle";
import { useStylePreview } from "./hooks/useStylePreview";

interface StyleCardProps {
  style: ArtStyle;
  croppedImage: string | null;
  isPopular?: boolean;
  isSelected?: boolean;
  cropAspectRatio?: number;
  preGeneratedPreview?: string;
  onStyleClick: (style: ArtStyle) => void;
  onContinue?: () => void;
}

const StyleCard = ({
  style,
  croppedImage,
  isPopular = false,
  isSelected = false,
  cropAspectRatio = 1,
  onStyleClick
}: StyleCardProps) => {
  const [showLightbox, setShowLightbox] = useState(false);

  const {
    isLoading,
    previewUrl,
    hasGeneratedPreview,
    handleClick
  } = useStylePreview({
    style,
    croppedImage,
    isPopular,
    onStyleClick
  });

  // Use preview URL if available, otherwise fall back to style image
  const displayImage = previewUrl || style.image;
  const shouldShowOriginal = style.id === 1;

  return (
    <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
      isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
    }`}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Image Display */}
          <div 
            className="relative overflow-hidden rounded-t-lg"
            style={{ aspectRatio: cropAspectRatio }}
          >
            <img
              src={displayImage}
              alt={style.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onClick={() => {
                handleClick();
                setShowLightbox(true);
              }}
            />
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-2">
              {isPopular && (
                <Badge className="bg-orange-500 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
              {shouldShowOriginal && (
                <Badge variant="secondary">
                  Original
                </Badge>
              )}
            </div>

            {/* Generation Status */}
            {hasGeneratedPreview && !shouldShowOriginal && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{style.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{style.description}</p>
            
            <Button
              onClick={handleClick}
              className="w-full"
              variant={isSelected ? "default" : "outline"}
            >
              {isSelected ? "Selected" : "Select Style"}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowLightbox(false)}
        >
          <div className="max-w-4xl max-h-4xl p-4">
            <img
              src={displayImage}
              alt={style.name}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default StyleCard;
