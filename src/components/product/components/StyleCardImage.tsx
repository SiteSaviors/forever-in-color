
import StyleCardImageDisplay from "./StyleCardImageDisplay";
import StyleCardIndicators from "./StyleCardIndicators";
import StyleCardLoadingOverlay from "./StyleCardLoadingOverlay";
import StyleCardSelectionOverlay from "./StyleCardSelectionOverlay";
import StyleCardBlurOverlay from "./StyleCardBlurOverlay";
import StyleCardRetryOverlay from "./StyleCardRetryOverlay";

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
  showError: boolean;
  error?: string;
  selectedOrientation?: string;
  previewUrl?: string | null;
  hasGeneratedPreview?: boolean;
  onExpandClick: () => void;
  onCanvasPreviewClick: () => void;
  onGenerateStyle: (e?: React.MouseEvent) => void;
  onRetry: (e?: React.MouseEvent) => void;
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
  showError,
  error,
  selectedOrientation = "square",
  previewUrl,
  hasGeneratedPreview = false,
  onExpandClick,
  onCanvasPreviewClick,
  onGenerateStyle,
  onRetry
}: StyleCardImageProps) => {
  return (
    <div className="relative group/image">
      {/* Main Image Display - Make this the priority on mobile */}
      <div className="relative min-h-[200px] md:min-h-[250px]">
        <StyleCardImageDisplay
          style={style}
          imageToShow={imageToShow}
          cropAspectRatio={cropAspectRatio}
          showLoadingState={showLoadingState}
          selectedOrientation={selectedOrientation}
          previewUrl={previewUrl}
          hasGeneratedPreview={hasGeneratedPreview}
          onExpandClick={onExpandClick}
        />
      </div>

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
        error={error}
      />

      <StyleCardRetryOverlay
        hasError={showError}
        error={error}
        onRetry={onRetry}
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
