
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle, Expand, Sparkles } from "lucide-react";
import StyleCardLoadingOverlay from "./StyleCardLoadingOverlay";
import MiniCanvasPreview from "./MiniCanvasPreview";

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

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🎨 Generate button clicked for ${style.name}`);
    if (onGenerateStyle) {
      onGenerateStyle(e);
    }
  };

  // Use a more prominent aspect ratio for better hero image treatment
  const heroAspectRatio = cropAspectRatio > 0 ? cropAspectRatio : 4/3;

  // Get style-specific selection colors - simplified without pulsating
  const getSelectionColors = () => {
    const colorMap: { [key: number]: { glow: string; check: string; bg: string } } = {
      1: { glow: "shadow-[0_0_30px_rgba(107,114,128,0.5)]", check: "bg-gray-600", bg: "bg-gray-50/90" },
      2: { glow: "shadow-[0_0_30px_rgba(245,158,11,0.5)]", check: "bg-amber-600", bg: "bg-amber-50/90" },
      4: { glow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]", check: "bg-blue-600", bg: "bg-blue-50/90" },
      5: { glow: "shadow-[0_0_30px_rgba(236,72,153,0.5)]", check: "bg-pink-600", bg: "bg-pink-50/90" },
      6: { glow: "shadow-[0_0_30px_rgba(168,85,247,0.5)]", check: "bg-purple-600", bg: "bg-purple-50/90" },
      7: { glow: "shadow-[0_0_30px_rgba(6,182,212,0.5)]", check: "bg-cyan-600", bg: "bg-cyan-50/90" },
      8: { glow: "shadow-[0_0_30px_rgba(100,116,139,0.5)]", check: "bg-slate-600", bg: "bg-slate-50/90" },
      9: { glow: "shadow-[0_0_30px_rgba(244,63,94,0.5)]", check: "bg-rose-600", bg: "bg-rose-50/90" },
      10: { glow: "shadow-[0_0_30px_rgba(34,197,94,0.5)]", check: "bg-emerald-600", bg: "bg-emerald-50/90" },
      11: { glow: "shadow-[0_0_30px_rgba(139,69,193,0.5)]", check: "bg-violet-600", bg: "bg-violet-50/90" },
      13: { glow: "shadow-[0_0_30px_rgba(99,102,241,0.5)]", check: "bg-indigo-600", bg: "bg-indigo-50/90" },
      15: { glow: "shadow-[0_0_30px_rgba(234,179,8,0.5)]", check: "bg-yellow-600", bg: "bg-yellow-50/90" },
    };
    
    return colorMap[style.id] || colorMap[1];
  };

  const selectionColors = getSelectionColors();

  return (
    <div className="relative">
      <AspectRatio ratio={heroAspectRatio} className="relative overflow-hidden rounded-t-xl">
        {/* Premium canvas frame effect - more refined */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-white p-3">
          <div className="w-full h-full bg-white rounded-lg shadow-inner border border-gray-200/50 overflow-hidden relative">
            {/* Hero Image Content - Now the star */}
            {imageToShow ? (
              <div className={`relative w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out ${shouldBlur ? 'blur-sm scale-105' : ''}`}>
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

            {/* Premium Blur Overlay with Generate Button - ONLY on image area with rounded corners */}
            {shouldBlur && (
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                {/* Sophisticated blur backdrop */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 backdrop-blur-md rounded-lg">
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-10"
                       style={{
                         backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                         backgroundSize: '20px 20px'
                       }}>
                  </div>
                </div>
                
                {/* Generate Button - Centered and clickable */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={handleGenerateClick}
                    disabled={isGenerating}
                    className="bg-white text-gray-900 hover:bg-gray-50 font-medium px-3 py-1.5 rounded-md shadow-xl border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl text-xs"
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
                
                {/* Premium corner indicator - smaller */}
                <div className="absolute top-2 right-2">
                  <div className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-xs font-medium text-gray-700 shadow-lg border border-white/50">
                    Click to Generate
                  </div>
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

        {/* Enhanced Expand Button - only show when image is clear and has content */}
        {hasPreviewOrCropped && !shouldBlur && (
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
        
        {/* Simplified Selection Overlay - clean purple glow without top-right clutter */}
        {isSelected && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {/* Static glowing border effect */}
            <div className={`absolute inset-0 rounded-t-xl ring-4 ring-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all duration-500`}></div>
            
            {/* Subtle selection background overlay */}
            <div className={`absolute inset-0 bg-purple-50/90 opacity-20 rounded-t-xl transition-all duration-300`}></div>
          </div>
        )}

        {/* Refined canvas shine effect for premium feel - only when not blurred */}
        {!shouldBlur && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
        )}
      </AspectRatio>

      {/* Selection confirmation text */}
      {isSelected && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-40">
          <div className={`bg-purple-50/90 text-purple-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white animate-slide-in`}>
            ✓ SELECTED
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleCardImage;
