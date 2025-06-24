
import StyleCardImageDisplay from "./StyleCardImageDisplay";
import StyleCardIndicators from "./StyleCardIndicators";
import StyleCardLoadingOverlay from "./StyleCardLoadingOverlay";
import StyleCardSelectionOverlay from "./StyleCardSelectionOverlay";
import StyleCardBlurOverlay from "./StyleCardBlurOverlay";

interface StyleCardImageProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  imageToShow: string;
  cropAspectRatio: number;
  showLoadingState: boolean;
  isPopular: boolean;
  showGeneratedBadge: boolean;
  isSelected: boolean;
  hasPreviewOrCropped: boolean;
  shouldBlur: boolean;
  isGenerating: boolean;
  selectedOrientation?: string;
  previewUrl?: string | null;
  hasGeneratedPreview?: boolean;
  onExpandClick: () => void;
  onCanvasPreviewClick: () => void;
  onGenerateStyle: (e?: React.MouseEvent) => void;
}

const StyleCardImage = ({
  style,
  imageToShow,
  cropAspectRatio,
  showLoadingState,
  isPopular,
  showGeneratedBadge,
  isSelected,
  hasPreviewOrCropped,
  shouldBlur,
  isGenerating,
  selectedOrientation = "square",
  previewUrl,
  hasGeneratedPreview = false,
  onExpandClick,
  onCanvasPreviewClick,
  onGenerateStyle
}: StyleCardImageProps) => {
  return (
    <div className="relative group/image">
      {/* Main Image Display */}
      <StyleCardImageDisplay
        style={style}
        imageToShow={imageToShow}
        cropAspectRatio={cropAspectRatio}
        showLoadingState={showLoadingState}
        selectedOrientation={selectedOrientation}
        previewUrl={previewUrl}
        hasGeneratedPreview={hasGeneratedPreview}
      />

      {/* Overlays and Indicators */}
      <StyleCardIndicators
        isPopular={isPopular}
        showGeneratedBadge={showGeneratedBadge}
        isSelected={isSelected}
        hasPreviewOrCropped={hasPreviewOrCropped}
        onExpandClick={onExpandClick}
        onCanvasPreviewClick={onCanvasPreviewClick}
      />

      <StyleCardLoadingOverlay
        isGenerating={isGenerating}
        styleName={style.name}
      />

      <StyleCardSelectionOverlay isSelected={isSelected} />

      <StyleCardBlurOverlay
        shouldBlur={shouldBlur}
        isGenerating={isGenerating}
        onGenerateStyle={onGenerateStyle}
      />
    </div>
  );
};

export default StyleCardImage;
