
import MorphingCanvasPreview from "./MorphingCanvasPreview";

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
    <MorphingCanvasPreview
      orientation={orientation}
      userImageUrl={userImageUrl}
      size={getDefaultSize(orientation)}
      isSelected={isSelected}
      isRecommended={isRecommended}
      onClick={onClick}
    />
  );
};

export default InteractiveCanvasPreview;
