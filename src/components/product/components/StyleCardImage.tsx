
import UnifiedImageDisplay from "./UnifiedImageDisplay";
import StyleCardLoadingOverlay from "./StyleCardLoadingOverlay";
import StyleCardBlurOverlay from "./StyleCardBlurOverlay";
import StyleCardRetryOverlay from "./StyleCardRetryOverlay";
import StyleCardIndicators from "./StyleCardIndicators";
import { useBlinking } from "../hooks/useBlinking";

interface StyleCardImageProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  imageToShow: string;
  cropAspectRatio: number;
  showLoadingState?: boolean;
  isPopular?: boolean;
  showGeneratedBadge?: boolean;
  isSelected?: boolean;
  hasPreviewOrCropped?: boolean;
  shouldBlur?: boolean;
  isGenerating?: boolean;
  showError?: boolean;
  error?: string | null;
  selectedOrientation?: string;
  previewUrl?: string | null;
  hasGeneratedPreview?: boolean;
  onExpandClick?: () => void;
  onCanvasPreviewClick?: () => void;
  onGenerateStyle?: () => void;
  onRetry?: () => void;
}

const StyleCardImage = ({
  style,
  imageToShow,
  cropAspectRatio,
  showLoadingState = false,
  isPopular = false,
  showGeneratedBadge = false,
  isSelected = false,
  hasPreviewOrCropped = false,
  shouldBlur = false,
  isGenerating = false,
  showError = false,
  error = null,
  selectedOrientation = 'square',
  previewUrl = null,
  hasGeneratedPreview = false,
  onExpandClick,
  onCanvasPreviewClick,
  onGenerateStyle,
  onRetry
}: StyleCardImageProps) => {
  
  // STEP 5: Use the centralized blinking hook
  const { isBlinking } = useBlinking(previewUrl);

  console.log(`StyleCardImage ${style.name}:`, {
    previewUrl: previewUrl ? previewUrl.substring(0, 30) + '...' : 'null',
    isBlinking,
    isGenerating,
    showError,
    hasGeneratedPreview
  });

  return (
    <div className="relative">
      {/* Main image display */}
      <UnifiedImageDisplay
        imageUrl={imageToShow}
        alt={`${style.name} preview`}
        aspectRatio={cropAspectRatio}
        showLoadingState={showLoadingState}
        hasGeneratedPreview={hasGeneratedPreview}
        selectedOrientation={selectedOrientation}
        previewUrl={previewUrl}
        onExpandClick={onExpandClick}
        variant={hasGeneratedPreview ? 'mockup' : 'standard'}
        isBlinking={isBlinking} // Pass controlled blinking state
      />

      {/* Indicators */}
      <StyleCardIndicators
        isPopular={isPopular}
        showGeneratedBadge={showGeneratedBadge}
        isSelected={isSelected}
        hasPreviewOrCropped={hasPreviewOrCropped}
        onCanvasPreviewClick={onCanvasPreviewClick}
      />

      {/* STEP 3: Pass single source of truth to overlays */}
      
      {/* Loading overlay - only show when blinking */}
      <StyleCardLoadingOverlay
        isBlinking={isBlinking}
        styleName={style.name}
        error={error}
      />

      {/* Blur overlay - pass blinking state */}
      <StyleCardBlurOverlay
        shouldBlur={shouldBlur}
        isBlinking={isBlinking}
        previewUrl={previewUrl}
        styleName={style.name}
        onGenerateStyle={onGenerateStyle || (() => {})}
      />

      {/* Error retry overlay */}
      {showError && onRetry && (
        <StyleCardRetryOverlay
          error={error}
          styleName={style.name}
          onRetry={onRetry}
        />
      )}
    </div>
  );
};

export default StyleCardImage;
