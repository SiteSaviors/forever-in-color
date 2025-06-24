
import StyleCardImageDisplay from "./StyleCardImageDisplay";
import StyleCardBlurOverlay from "./StyleCardBlurOverlay";
import StyleCardSelectionOverlay from "./StyleCardSelectionOverlay";
import StyleCardLoadingOverlay from "./StyleCardLoadingOverlay";

interface StyleCardImageProps {
  style: {
    id: number;
    name: string;
    image: string;
  };
  imageToShow: string;
  cropAspectRatio: number;
  showLoadingState: boolean;
  isPopular: boolean;
  showGeneratedBadge: boolean;
  isSelected: boolean;
  hasPreviewOrCropped: boolean;
  shouldBlur?: boolean;
  isGenerating?: boolean;
  onExpandClick: (e: React.MouseEvent) => void;
  onCanvasPreviewClick?: (e: React.MouseEvent) => void;
  onGenerateStyle?: (e?: React.MouseEvent) => void;
}

const StyleCardImage = ({
  style,
  imageToShow,
  cropAspectRatio,
  showLoadingState,
  isSelected,
  hasPreviewOrCropped,
  shouldBlur = false,
  isGenerating = false,
  onExpandClick,
  onGenerateStyle
}: StyleCardImageProps) => {
  const showBlurOverlay = shouldBlur && !isGenerating && !hasPreviewOrCropped;

  const handleGenerateStyle = (e: React.MouseEvent) => {
    if (onGenerateStyle) {
      onGenerateStyle(e);
    }
  };

  return (
    <div className="relative">
      <StyleCardImageDisplay
        style={style}
        imageToShow={imageToShow}
        cropAspectRatio={cropAspectRatio}
        hasPreviewOrCropped={hasPreviewOrCropped}
        shouldBlur={shouldBlur}
        onExpandClick={onExpandClick}
      />

      {/* Blur Overlay */}
      {showBlurOverlay && (
        <StyleCardBlurOverlay
          style={style}
          isGenerating={isGenerating}
          onGenerateClick={handleGenerateStyle}
        />
      )}

      {/* Loading Overlay */}
      {showLoadingState && <StyleCardLoadingOverlay />}
      
      {/* Selection Overlay */}
      <StyleCardSelectionOverlay isSelected={isSelected} />
    </div>
  );
};

export default StyleCardImage;
