
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";

interface StyleCardBlurOverlayProps {
  shouldBlur: boolean;
  isGenerating: boolean;
  styleName?: string;
  onGenerateStyle: (e?: React.MouseEvent) => void;
}

const StyleCardBlurOverlay = ({ shouldBlur, isGenerating, styleName, onGenerateStyle }: StyleCardBlurOverlayProps) => {
  // Only show blur overlay if we explicitly should blur and we're not currently generating
  if (!shouldBlur || isGenerating) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGenerateStyle(e);
  };

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-15 rounded-lg">
      <div className="text-center space-y-4 p-4">
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center">
          <Zap className="w-8 h-8 text-purple-600" />
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-sm">
            {styleName || "Generate This Style"}
          </h4>
          <p className="text-xs text-gray-600 max-w-32">
            Click to see your photo transformed with AI
          </p>
        </div>
        
        <Button
          onClick={handleClick}
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Generate
        </Button>
      </div>
    </div>
  );
};

export default StyleCardBlurOverlay;
