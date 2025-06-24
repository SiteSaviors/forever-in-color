import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCircle, Expand } from "lucide-react";
import StyleCardLoadingOverlay from "./StyleCardLoadingOverlay";
import MiniCanvasPreview from "./MiniCanvasPreview";
import StyleFloatingBadge from "./StyleFloatingBadge";

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

  // Use a more prominent aspect ratio for better hero image treatment
  const heroAspectRatio = cropAspectRatio > 0 ? cropAspectRatio : 4/3;

  return (
    <AspectRatio ratio={heroAspectRatio} className="relative overflow-hidden rounded-t-xl">
      {/* Premium canvas frame effect - more refined */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-white p-3">
        <div className="w-full h-full bg-white rounded-lg shadow-inner border border-gray-200/50 overflow-hidden relative">
          {/* Hero Image Content - Now the star */}
          {imageToShow ? (
            <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out">
              <img 
                src={imageToShow} 
                alt={style.name}
                className="w-full h-full object-cover"
              />
              {/* Subtle image overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
            </div>
          ) : (
            // Enhanced placeholder with better visual hierarchy
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
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

          {/* Refined canvas texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
               style={{
                 backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
                 backgroundSize: '12px 12px'
               }}>
          </div>
        </div>
      </div>

      {/* NEW: Floating Style Badge */}
      <StyleFloatingBadge styleId={style.id} styleName={style.name} />

      {/* Mini Canvas Preview - refined positioning */}
      {showGeneratedBadge && imageToShow && (
        <div className="absolute top-3 right-3 z-10">
          <MiniCanvasPreview 
            imageUrl={imageToShow}
            orientation={orientation}
            className="opacity-90 hover:opacity-100 transition-all duration-200 shadow-lg"
            onClick={handleCanvasPreviewClick}
          />
        </div>
      )}

      {/* Enhanced Expand Button */}
      {hasPreviewOrCropped && (
        <button
          onClick={onExpandClick}
          className="absolute bottom-3 left-3 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg backdrop-blur-sm border border-white/20"
          title="View full size"
        >
          <Expand className="w-4 h-4" />
        </button>
      )}

      {/* Loading Overlay */}
      {showLoadingState && <StyleCardLoadingOverlay />}

      {/* Refined Generated Badge - moved to top-right */}
      {showGeneratedBadge && (
        <div className="absolute top-3 right-3 z-20">
          <Badge variant="secondary" className="bg-white/95 text-gray-700 font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-sm border border-white/30">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-xs">Generated</span>
          </Badge>
        </div>
      )}
      
      {/* Enhanced Selection Indicator - moved to bottom-right */}
      {isSelected && (
        <div className="absolute bottom-3 right-3 z-20">
          <div className="bg-purple-600 text-white rounded-full p-2 shadow-lg ring-2 ring-white/50">
            <Check className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Refined canvas shine effect for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
    </AspectRatio>
  );
};

export default StyleCardImage;
