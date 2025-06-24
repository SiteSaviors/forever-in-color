
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Expand } from "lucide-react";

interface StyleCardImageDisplayProps {
  style: {
    id: number;
    name: string;
    image: string;
  };
  imageToShow: string;
  cropAspectRatio: number;
  hasPreviewOrCropped: boolean;
  shouldBlur?: boolean;
  onExpandClick: (e: React.MouseEvent) => void;
}

const StyleCardImageDisplay = ({
  style,
  imageToShow,
  cropAspectRatio,
  hasPreviewOrCropped,
  shouldBlur = false,
  onExpandClick
}: StyleCardImageDisplayProps) => {
  const heroAspectRatio = cropAspectRatio > 0 ? cropAspectRatio : 4/3;

  return (
    <AspectRatio ratio={heroAspectRatio} className="relative overflow-hidden rounded-t-xl">
      {/* Canvas frame */}
      <div className="absolute inset-0 bg-gray-100 p-3">
        <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200/50 overflow-hidden relative">
          {/* Hero Image Content */}
          {imageToShow ? (
            <div className={`relative w-full h-full transition-transform duration-200 ease-out group-hover:scale-[1.02] ${shouldBlur ? 'blur-sm' : ''}`}>
              <img 
                src={imageToShow} 
                alt={style.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 relative">
              <div className="text-center opacity-60">
                <img 
                  src={style.image} 
                  alt={style.name}
                  className="w-16 h-16 mx-auto mb-2 opacity-50"
                />
                <p className="text-xs text-gray-500 font-medium">Style Preview</p>
              </div>
            </div>
          )}

          {/* Expand Button - only show when we have content and not blurred */}
          {hasPreviewOrCropped && !shouldBlur && (
            <button
              onClick={onExpandClick}
              className="absolute bottom-3 left-3 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg"
              title="View full size"
            >
              <Expand className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </AspectRatio>
  );
};

export default StyleCardImageDisplay;
