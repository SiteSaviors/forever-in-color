
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Expand, Sparkles } from "lucide-react";
import StyleCardLoadingOverlay from "./StyleCardLoadingOverlay";

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
  shouldBlur?: boolean;
  isGenerating?: boolean;
  onExpandClick: (e: React.MouseEvent) => void;
  onCanvasPreviewClick?: (e: React.MouseEvent) => void;
  onGenerateStyle?: (e?: React.MouseEvent) => void;
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
  shouldBlur = false,
  isGenerating = false,
  onExpandClick,
  onCanvasPreviewClick,
  onGenerateStyle
}: StyleCardImageProps) => {
  const handleCanvasPreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCanvasPreviewClick) {
      onCanvasPreviewClick(e);
    }
  };

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🎨 GENERATE BUTTON CLICKED ▶️ ${style.name} (ID: ${style.id})`);
    if (onGenerateStyle) {
      onGenerateStyle(e);
    }
  };

  const heroAspectRatio = cropAspectRatio > 0 ? cropAspectRatio : 4/3;
  const showBlurOverlay = shouldBlur && !isGenerating && !hasPreviewOrCropped;

  return (
    <div className="relative">
      <AspectRatio ratio={heroAspectRatio} className="relative overflow-hidden rounded-t-xl">
        {/* Simplified canvas frame - removed heavy gradients */}
        <div className="absolute inset-0 bg-gray-100 p-3">
          <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200/50 overflow-hidden relative">
            {/* Hero Image Content - Simplified transitions */}
            {imageToShow ? (
              <div className={`relative w-full h-full transition-transform duration-200 ease-out group-hover:scale-[1.02] ${showBlurOverlay ? 'blur-sm' : ''}`}>
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

            {/* Simplified Blur Overlay */}
            {showBlurOverlay && (
              <div 
                className="absolute inset-0 rounded-lg overflow-hidden z-20 cursor-pointer bg-black/50"
                onClick={handleGenerateClick}
              >
                {/* Generate Button - Simplified styling */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={handleGenerateClick}
                    disabled={isGenerating}
                    className="bg-white text-gray-900 hover:bg-gray-50 font-medium px-3 py-1.5 rounded-md shadow-lg transition-all duration-150 hover:scale-105 text-xs"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Generate This Style</span>
                      </div>
                    )}
                  </Button>
                </div>
                
                {/* Simplified corner indicator */}
                <div className="absolute top-2 right-2">
                  <div className="bg-white/90 px-1.5 py-0.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    Click to Generate
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Simplified Expand Button */}
        {hasPreviewOrCropped && !showBlurOverlay && (
          <button
            onClick={onExpandClick}
            className="absolute bottom-3 left-3 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg"
            title="View full size"
          >
            <Expand className="w-4 h-4" />
          </button>
        )}

        {/* Loading Overlay */}
        {showLoadingState && <StyleCardLoadingOverlay />}
        
        {/* Simplified Selection Overlay */}
        {isSelected && (
          <div className="absolute inset-0 pointer-events-none z-30">
            <div className="absolute inset-0 rounded-t-xl ring-4 ring-purple-500 shadow-lg transition-all duration-200"></div>
            <div className="absolute inset-0 bg-purple-50/20 rounded-t-xl transition-all duration-200"></div>
          </div>
        )}
      </AspectRatio>

      {/* Selection confirmation text */}
      {isSelected && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-purple-50/90 text-purple-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white">
            ✓ SELECTED
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleCardImage;
