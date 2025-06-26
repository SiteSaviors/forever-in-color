
import UnifiedImageDisplay from "./UnifiedImageDisplay";

interface StyleCardImageDisplayProps {
  style: {
    id: number;
    name: string;
    image: string;
  };
  imageToShow: string;
  cropAspectRatio: number;
  showLoadingState: boolean;
  selectedOrientation: string;
  previewUrl?: string | null;
  hasGeneratedPreview: boolean;
  onExpandClick?: () => void;
}

const StyleCardImageDisplay = ({
  style,
  imageToShow,
  cropAspectRatio,
  showLoadingState,
  selectedOrientation,
  previewUrl,
  hasGeneratedPreview,
  onExpandClick
}: StyleCardImageDisplayProps) => {
  // Use mockup variant for generated previews, regular for others
  const variant = hasGeneratedPreview && previewUrl && style.id !== 1 ? 'mockup' : 'standard';

  return (
    <UnifiedImageDisplay
      imageUrl={imageToShow}
      alt={style.name}
      aspectRatio={cropAspectRatio}
      showLoadingState={showLoadingState}
      hasGeneratedPreview={hasGeneratedPreview}
      selectedOrientation={selectedOrientation}
      previewUrl={previewUrl}
      onExpandClick={onExpandClick}
      variant={variant}
    />
  );
};

export default StyleCardImageDisplay;
