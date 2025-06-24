
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MockupCanvas } from "../MockupCanvas";

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
}

const StyleCardImageDisplay = ({
  style,
  imageToShow,
  cropAspectRatio,
  showLoadingState,
  selectedOrientation,
  previewUrl,
  hasGeneratedPreview
}: StyleCardImageDisplayProps) => {
  // Use MockupCanvas for generated previews, regular image for others
  const shouldUseMockup = hasGeneratedPreview && previewUrl && style.id !== 1;

  if (shouldUseMockup) {
    return (
      <div className="w-full">
        <MockupCanvas 
          previewUrl={previewUrl}
          orientation={selectedOrientation as 'square' | 'horizontal' | 'vertical'}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  // Fallback to regular image display
  return (
    <AspectRatio ratio={cropAspectRatio} className="relative overflow-hidden rounded-lg">
      <img
        src={imageToShow}
        alt={style.name}
        className={`w-full h-full object-cover transition-all duration-300 ${
          showLoadingState ? 'opacity-50 blur-sm' : 'opacity-100'
        } group-hover:scale-105`}
      />
      
      {showLoadingState && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      )}
    </AspectRatio>
  );
};

export default StyleCardImageDisplay;
