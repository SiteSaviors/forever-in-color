
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MockupCanvas } from "../MockupCanvas";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Expand } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  onExpandClick?: () => void;
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
  const isMobile = useIsMobile();
  
  // Use MockupCanvas for generated previews, regular image for others
  const shouldUseMockup = hasGeneratedPreview && previewUrl && style.id !== 1;

  // Calculate aspect ratio based on selected orientation - mobile optimized
  const getOrientationAspectRatio = () => {
    switch (selectedOrientation) {
      case 'vertical':
        return isMobile ? 3/4 : 3/4; // Portrait aspect ratio
      case 'horizontal':
        return isMobile ? 4/3 : 4/3; // Landscape aspect ratio
      case 'square':
      default:
        return isMobile ? 4/5 : 1; // Slightly taller on mobile for better touch interaction
    }
  };

  const orientationAspectRatio = getOrientationAspectRatio();

  // Show expand button if there's an image to expand and handler is provided
  const canExpand = (previewUrl || imageToShow) && onExpandClick && !showLoadingState;

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
        {/* Enhanced expand button for mobile */}
        {canExpand && (
          <button
            onClick={onExpandClick}
            className={`absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 z-10 shadow-lg
              ${isMobile ? 'p-3 w-10 h-10' : 'p-2 w-8 h-8'}
            `}
            title="View full size"
          >
            <Expand className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
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
      
      {/* Enhanced expand button for mobile */}
      {canExpand && (
        <button
          onClick={onExpandClick}
          className={`absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 z-10 shadow-lg
            ${isMobile ? 'p-3 w-10 h-10' : 'p-2 w-8 h-8'}
          `}
          title="View full size"
        >
          <Expand className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
        </button>
      )}
      
      {/* Standardized loading overlay */}
      {showLoadingState && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <LoadingSpinner size={isMobile ? "lg" : "md"} variant="default" />
        </div>
      )}
    </AspectRatio>
  );
};

export default StyleCardImageDisplay;
