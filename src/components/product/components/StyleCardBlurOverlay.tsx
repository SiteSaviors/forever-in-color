
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { getZIndexClass } from "@/utils/zIndexLayers";

interface StyleCardBlurOverlayProps {
  shouldBlur: boolean;
  isGenerating: boolean;
  styleName?: string;
  onGenerateStyle: (e?: React.MouseEvent) => void;
}

/**
 * StyleCardBlurOverlay Component
 * 
 * Provides a blurred overlay on style cards that haven't been generated yet,
 * encouraging users to click and generate AI previews.
 * 
 * Visual Hierarchy:
 * - Uses STYLE_CARD_OVERLAYS z-index layer to sit above card content
 * - Backdrop blur creates visual separation from card background
 * - Generate button positioned with higher z-index for accessibility
 * 
 * Interaction Logic:
 * - Only shows when shouldBlur is true AND not currently generating
 * - Prevents event bubbling to avoid card selection conflicts
 * - Click handler triggers AI generation for the specific style
 */
const StyleCardBlurOverlay = ({ 
  shouldBlur, 
  isGenerating, 
  styleName, 
  onGenerateStyle 
}: StyleCardBlurOverlayProps) => {
  // Only show blur overlay if we explicitly should blur and we're not currently generating
  if (!shouldBlur || isGenerating) return null;

  /**
   * Handle click events with proper event isolation
   * Prevents event bubbling to parent card to avoid selection conflicts
   */
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGenerateStyle(e);
  };

  return (
    <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg ${getZIndexClass('STYLE_CARD_OVERLAYS', 1)}`}>
      <div className="text-center space-y-4 p-4">
        {/* Icon container with gradient background for visual appeal */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center">
          <Zap className="w-8 h-8 text-purple-600" />
        </div>
        
        {/* Content section with clear hierarchy */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-sm">
            {styleName || "Generate This Style"}
          </h4>
          <p className="text-xs text-gray-600 max-w-32">
            Click to see your photo transformed with AI
          </p>
        </div>
        
        {/* Generate button with higher z-index for touch accessibility */}
        <Button
          onClick={handleClick}
          size="sm"
          className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 ${getZIndexClass('STYLE_CARD_OVERLAYS', 2)}`}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Generate
        </Button>
      </div>
    </div>
  );
};

export default StyleCardBlurOverlay;
