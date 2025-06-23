
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCircle, Expand } from "lucide-react";
import StyleCardLoadingOverlay from "./StyleCardLoadingOverlay";
import MiniCanvasPreview from "./MiniCanvasPreview";

interface StyleCardImageProps {
  style: {
    id: number;
    name: string;
    image: string;
  };
  imageToShow: string;
  cropAspectRatio: number;
  showLoadingState: boolean;
  isPopular: boolean;
  showGeneratedBadge: boolean;
  isSelected: boolean;
  hasPreviewOrCropped: boolean;
  onExpandClick: (e: React.MouseEvent) => void;
  onCanvasPreviewClick?: (e: React.MouseEvent) => void;
}

const StyleCardImage = ({
  style,
  imageToShow,
  cropAspectRatio,
  showLoadingState,
  isPopular,
  showGeneratedBadge,
  isSelected,
  hasPreviewOrCropped,
  onExpandClick,
  onCanvasPreviewClick
}: StyleCardImageProps) => {
  // Determine orientation from crop aspect ratio
  const getOrientation = () => {
    if (cropAspectRatio === 1) return "square";
    if (cropAspectRatio > 1) return "horizontal";
    return "vertical";
  };

  const orientation = getOrientation();

  const handleCanvasPreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCanvasPreviewClick) {
      onCanvasPreviewClick(e);
    }
  };

  return (
    <AspectRatio ratio={cropAspectRatio} className="relative overflow-hidden rounded-t-lg">
      {/* Canvas Frame Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 p-2">
        <div className="w-full h-full bg-white border border-gray-300 shadow-inner rounded-sm overflow-hidden">
          {/* Image Content */}
          {imageToShow ? (
            <img 
              src={imageToShow} 
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

      {/* Mini Canvas Preview in corner when there's a generated image */}
      {showGeneratedBadge && imageToShow && (
        <div className="absolute top-2 right-2 z-10">
          <MiniCanvasPreview 
            imageUrl={imageToShow}
            orientation={orientation}
            className="opacity-90 hover:opacity-100 transition-opacity"
            onClick={handleCanvasPreviewClick}
          />
        </div>
      )}

      {/* Expand Button - Only show when there's a generated or cropped image */}
      {hasPreviewOrCropped && (
        <button
          onClick={onExpandClick}
          className="absolute top-2 left-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          title="View full size"
        >
          <Expand className="w-4 h-4" />
        </button>
      )}

      {/* Loading Overlay */}
      {showLoadingState && <StyleCardLoadingOverlay />}

      {/* Already Generated Badge - Only show this badge on images */}
      {showGeneratedBadge && (
        <div className="absolute top-3 right-3 z-20">
          <Badge variant="secondary" className="bg-gray-100/90 text-gray-600 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Generated
          </Badge>
        </div>
      )}
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-purple-600 text-white rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Canvas shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
    </AspectRatio>
  );
};

export default StyleCardImage;
