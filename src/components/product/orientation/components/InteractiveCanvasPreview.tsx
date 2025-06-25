import MorphingCanvasPreview from "./MorphingCanvasPreview";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface InteractiveCanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
  isSelected: boolean;
  isRecommended?: boolean;
  onClick: () => void;
}

const InteractiveCanvasPreview = ({ 
  orientation, 
  userImageUrl, 
  isSelected, 
  isRecommended = false,
  onClick 
}: InteractiveCanvasPreviewProps) => {
  // Get a default size for the preview
  const getDefaultSize = (orientation: string) => {
    switch (orientation) {
      case 'horizontal': return '18" x 24"';
      case 'vertical': return '16" x 20"';
      case 'square': return '16" x 16"';
      default: return '16" x 16"';
    }
  };

  return (
    <div className="relative">
      <MorphingCanvasPreview
        orientation={orientation}
        userImageUrl={userImageUrl}
        size={getDefaultSize(orientation)}
        isSelected={isSelected}
        isRecommended={isRecommended}
        onClick={onClick}
      />
      
      {/* Canvas Preview indicator */}
      <div className="absolute -top-2 -left-2 z-30">
        <Badge className="bg-green-500 text-white px-2 py-1 text-xs shadow-lg flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Canvas Preview
        </Badge>
      </div>
    </div>
  );
};

export default InteractiveCanvasPreview;