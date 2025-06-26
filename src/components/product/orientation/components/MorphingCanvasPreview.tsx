
import UnifiedCanvasPreview from "./UnifiedCanvasPreview";

interface MorphingCanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
  size: string;
  isSelected: boolean;
  isRecommended?: boolean;
  onClick: () => void;
}

const MorphingCanvasPreview = (props: MorphingCanvasPreviewProps) => {
  return <UnifiedCanvasPreview {...props} variant="morphing" />;
};

export default MorphingCanvasPreview;
