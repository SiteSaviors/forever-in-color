
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MockupCanvas } from "../MockupCanvas";
import { Expand } from "lucide-react";
import ProgressiveImage from "@/components/ui/progressive-image";
import { ImageSkeleton } from "@/components/ui/skeleton";

interface UnifiedImageDisplayProps {
  imageUrl: string;
  alt: string;
  aspectRatio: number;
  showLoadingState?: boolean;
  hasGeneratedPreview?: boolean;
  selectedOrientation?: string;
  previewUrl?: string | null;
  showExpandButton?: boolean;
  onExpandClick?: () => void;
  variant?: 'standard' | 'mockup';
}

const UnifiedImageDisplay = ({
  imageUrl,
  alt,
  aspectRatio,
  showLoadingState = false,
  hasGeneratedPreview = false,
  selectedOrientation = 'square',
  previewUrl,
  showExpandButton = true,
  onExpandClick,
  variant = 'standard'
}: UnifiedImageDisplayProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use MockupCanvas for generated previews, regular image for others
  const shouldUseMockup = variant === 'mockup' && hasGeneratedPreview && previewUrl;
  
  // Show expand button if there's an image to expand and handler is provided
  const canExpand = (previewUrl || imageUrl) && onExpandClick && !showLoadingState && showExpandButton;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    // Error handled silently
  };

  if (shouldUseMockup) {
    return (
      <AspectRatio ratio={aspectRatio} className="relative overflow-hidden rounded-lg group">
        <div className="w-full h-full">
          <MockupCanvas 
            previewUrl={previewUrl}
            orientation={selectedOrientation as 'square' | 'horizontal' | 'vertical'}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-2xl"
          />
        </div>
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

  // Standard progressive image display
  return (
    <AspectRatio ratio={aspectRatio} className="relative overflow-hidden rounded-lg group">
      {showLoadingState ? (
        <ImageSkeleton className="w-full h-full" aspectRatio={aspectRatio} />
      ) : (
        <ProgressiveImage
          src={imageUrl}
          alt={alt}
          aspectRatio={aspectRatio}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`transition-all duration-300 group-hover:scale-105 ${
            hasGeneratedPreview && previewUrl ? 'drop-shadow-2xl' : ''
          }`}
          showSkeleton={!imageLoaded}
        />
      )}
      
      {canExpand && imageLoaded && (
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
};

export default UnifiedImageDisplay;
