
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MockupCanvas } from "../MockupCanvas";
import { Expand } from "lucide-react";

interface StyleCardImageDisplayProps {
  style: {
    id: number;
    name: string;
    image: string;
  };
  imageToShow: string;
  cropAspectRatio: number;
  showLoadingState: boolean;
  selectedOrientation: string;
  previewUrl?: string | null;
  hasGeneratedPreview: boolean;
  onExpandClick?: (e: React.MouseEvent) => void;
}

const StyleCardImageDisplay = ({
  style,
  imageToShow,
  cropAspectRatio,
  showLoadingState,
  selectedOrientation,
  previewUrl,
  hasGeneratedPreview,
  onExpandClick
}: StyleCardImageDisplayProps) => {
  // Use MockupCanvas for generated previews, regular image for others
  const shouldUseMockup = hasGeneratedPreview && previewUrl && style.id !== 1;

  // Calculate aspect ratio based on selected orientation
  const getOrientationAspectRatio = () => {
    switch (selectedOrientation) {
      case 'vertical':
        return 3/4; // Portrait aspect ratio
      case 'horizontal':
        return 4/3; // Landscape aspect ratio
      case 'square':
      default:
        return 1; // Square aspect ratio
    }
  };

  const orientationAspectRatio = getOrientationAspectRatio();

  // Show expand button if there's an image to expand and handler is provided
  const canExpand = (finalPreviewUrl || croppedImage || imageToShow) && onExpandClick && !showLoadingState;

  if (shouldUseMockup) {
    return (
      <AspectRatio ratio={orientationAspectRatio} className="relative overflow-hidden rounded-lg group">
        <div className="w-full h-full">
          <MockupCanvas 
            previewUrl={previewUrl}
            orientation={selectedOrientation as 'square' | 'horizontal' | 'vertical'}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-2xl"
          />
        </div>
        {/* Expand button - always visible on mobile, hover on desktop */}
        {canExpand && (
          <button
            onClick={onExpandClick}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 z-10 shadow-lg"
            title="View full size"
          >
            <Expand className="w-4 h-4" />
          </button>
        )}
      </AspectRatio>
    );
  }

  // Fallback to regular image display
  return (
    <AspectRatio ratio={orientationAspectRatio} className="relative overflow-hidden rounded-lg group">
      <img
        src={imageToShow}
        alt={style.name}
        className={`w-full h-full object-cover transition-all duration-300 ${
          showLoadingState ? 'opacity-50 blur-sm' : 'opacity-100'
        } group-hover:scale-105 ${
          hasGeneratedPreview && previewUrl ? 'drop-shadow-2xl' : ''
        }`}
      />
      
      {/* Expand button - always visible on mobile, hover on desktop */}
      {canExpand && (
        <button
          onClick={onExpandClick}
          className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 z-10 shadow-lg"
          title="View full size"
        >
          <Expand className="w-4 h-4" />
        </button>
      )}
      
      {showLoadingState && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      )}
    </AspectRatio>
  );
};

export default StyleCardImageDisplay;
