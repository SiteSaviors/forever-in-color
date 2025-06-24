
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface StyleCardBlurOverlayProps {
  style: {
    id: number;
    name: string;
  };
  isGenerating?: boolean;
  onGenerateClick: (e: React.MouseEvent) => void;
}

const StyleCardBlurOverlay = ({
  style,
  isGenerating = false,
  onGenerateClick
}: StyleCardBlurOverlayProps) => {
  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🎨 GENERATE BUTTON CLICKED ▶️ ${style.name} (ID: ${style.id})`);
    onGenerateClick(e);
  };

  return (
    <div 
      className="absolute inset-0 rounded-lg overflow-hidden z-20 cursor-pointer bg-black/50"
      onClick={handleGenerateClick}
    >
      {/* Generate Button */}
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
      
      {/* Corner indicator */}
      <div className="absolute top-2 right-2">
        <div className="bg-white/90 px-1.5 py-0.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
          Click to Generate
        </div>
      </div>
    </div>
  );
};

export default StyleCardBlurOverlay;
