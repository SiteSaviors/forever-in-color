
import { Sparkles } from "lucide-react";

interface StyleCardLoadingOverlayProps {
  isGenerating: boolean;
  styleName: string;
}

const StyleCardLoadingOverlay = ({ isGenerating, styleName }: StyleCardLoadingOverlayProps) => {
  if (!isGenerating) return null;

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
      <div className="text-white text-center space-y-3 px-4">
        <div className="relative">
          <Sparkles className="w-8 h-8 mx-auto animate-pulse text-purple-400" />
          <div className="absolute inset-0 animate-spin">
            <div className="w-8 h-8 border-2 border-transparent border-t-white/50 rounded-full mx-auto"></div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">Creating {styleName}...</p>
          <p className="text-xs text-gray-300">This may take 10-15 seconds</p>
        </div>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );
};

export default StyleCardLoadingOverlay;
