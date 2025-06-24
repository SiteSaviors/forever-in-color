
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
  // Use MockupCanvas for generated previews, regular image for others
  const shouldUseMockup = hasGeneratedPreview && previewUrl && style.id !== 1;

  if (shouldUseMockup) {
    return (
      <div className="w-full relative group">
        <MockupCanvas 
          previewUrl={previewUrl}
          orientation={selectedOrientation as 'square' | 'horizontal' | 'vertical'}
          className="transition-transform duration-300 group-hover:scale-105 drop-shadow-2xl"
        />
        {/* Mobile-only expand button - always visible on mobile */}
        {onExpandClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpandClick();
            }}
            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 sm:hidden md:block"
          >
            <Expand className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Fallback to regular image display
  return (
    <AspectRatio ratio={cropAspectRatio} className="relative overflow-hidden rounded-lg group">
      <img
        src={imageToShow}
        alt={style.name}
        className={`w-full h-full object-cover transition-all duration-300 ${
          showLoadingState ? 'opacity-50 blur-sm' : 'opacity-100'
        } group-hover:scale-105 ${
          hasGeneratedPreview && previewUrl ? 'drop-shadow-2xl' : ''
        }`}
      />
      
      {/* Mobile-only expand button - always visible on mobile */}
      {onExpandClick && !showLoadingState && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpandClick();
          }}
          className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 sm:hidden md:block"
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
