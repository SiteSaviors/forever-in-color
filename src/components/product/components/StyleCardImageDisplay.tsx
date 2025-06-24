
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  // Use canvas mockup for generated previews, regular image for others
  const shouldUseMockup = hasGeneratedPreview && previewUrl && style.id !== 1;

  if (shouldUseMockup) {
    return (
      <AspectRatio ratio={cropAspectRatio} className="relative overflow-hidden rounded-lg">
        {/* Base canvas background */}
        <img
          src="/lovable-uploads/49a21cb0-066f-41d1-8814-77c3db03ab1c.png"
          alt="Canvas background"
          className="w-full h-full object-cover"
        />
        
        {/* Generated artwork overlay */}
        <img
          src={previewUrl}
          alt={style.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
            showLoadingState ? 'opacity-50 blur-sm' : 'opacity-100'
          } group-hover:scale-105`}
          style={{
            // Position the artwork within the canvas frame
            top: '8%',
            left: '8%',
            width: '84%',
            height: '84%',
            position: 'absolute',
          }}
        />
        
        {showLoadingState && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </AspectRatio>
    );
  }

  // Regular image display for non-generated previews
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
