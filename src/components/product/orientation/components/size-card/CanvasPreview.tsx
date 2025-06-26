
import UnifiedCanvasPreview from "../UnifiedCanvasPreview";

interface CanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
}

const CanvasPreview = ({ orientation, userImageUrl }: CanvasPreviewProps) => {
  return (
    <UnifiedCanvasPreview
      orientation={orientation}
      userImageUrl={userImageUrl}
      isSelected={false}
      onClick={() => {}} // No-op for size card preview
      variant="simple"
    />
  );
};

export default CanvasPreview;
