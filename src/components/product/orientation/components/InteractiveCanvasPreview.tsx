
import UnifiedCanvasPreview from "./UnifiedCanvasPreview";

interface InteractiveCanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
  isSelected: boolean;
  isRecommended?: boolean;
  onClick: () => void;
}

const InteractiveCanvasPreview = (props: InteractiveCanvasPreviewProps) => {
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
    <UnifiedCanvasPreview 
      {...props} 
      size={getDefaultSize(props.orientation)}
      variant="interactive" 
    />
  );
};

export default InteractiveCanvasPreview;
