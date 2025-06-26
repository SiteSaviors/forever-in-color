
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MockupCanvas } from "../MockupCanvas";
import { Expand } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useLazyLoading } from "@/hooks/useLazyLoading";
import { predictivePreloader } from "@/utils/performanceUtils";
import { useEffect } from "react";

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
  // Use MockupCanvas for generated previews, regular image for others
  const shouldUseMockup = variant === 'mockup' && hasGeneratedPreview && previewUrl;
  
  // Show expand button if there's an image to expand and handler is provided
  const canExpand = (previewUrl || imageUrl) && onExpandClick && !showLoadingState && showExpandButton;

  // Predictive preloading based on user behavior
  useEffect(() => {
    if (imageUrl && selectedOrientation) {
      // Preload canvas frames for current orientation
      predictivePreloader.preloadCanvasFrames(selectedOrientation as 'square' | 'horizontal' | 'vertical');
    }
  }, [imageUrl, selectedOrientation]);

  // Lazy loading setup for better performance
  const {
    ref: lazyRef,
    isLoading: isLazyLoading,
    isLoaded,
    hasError
  } = useLazyLoading(imageUrl, {
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  });

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

  // Standard optimized image display
  return (
    <AspectRatio ratio={aspectRatio} className="relative overflow-hidden rounded-lg group">
      <OptimizedImage
        ref={lazyRef}
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
          showLoadingState ? 'opacity-50 blur-sm' : 'opacity-100'
        } group-hover:scale-105 ${
          hasGeneratedPreview && previewUrl ? 'drop-shadow-2xl' : ''
        }`}
        lazy={true}
        quality={0.85}
        maxWidth={1200}
        maxHeight={1200}
        enableSrcSet={true}
        placeholderClassName="w-full h-full bg-gray-200 animate-pulse rounded-lg"
        onLoadComplete={() => {
          // Preload related content after image loads
          if (hasGeneratedPreview) {
            predictivePreloader.preloadRelatedStyles(1); // Adjust based on style ID
          }
        }}
      />
      
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

export default UnifiedImageDisplay;
