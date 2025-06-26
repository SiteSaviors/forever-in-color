
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
  
  // STEP 5: Use the centralized blinking hook with isGenerating parameter
  const { isBlinking } = useBlinking(previewUrl, { isGenerating });

  // ENHANCED DEBUG: Log the complete state picture
  console.log(`🎭 StyleCardImage ${style.name} COMPLETE STATE:`, {
    previewUrl: previewUrl ? previewUrl.substring(0, 30) + '...' : 'null',
    isBlinking,
    isGenerating,
    showError,
    hasGeneratedPreview,
    shouldShowLoadingOverlay: isBlinking && isGenerating && !previewUrl,
    timestamp: new Date().toISOString()
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
        isBlinking={isBlinking && !previewUrl} // CRITICAL: Don't blink if preview exists
      />

      {/* Indicators */}
      <StyleCardIndicators
        isPopular={isPopular}
        showGeneratedBadge={showGeneratedBadge}
        isSelected={isSelected}
        hasPreviewOrCropped={hasPreviewOrCropped}
        onExpandClick={onExpandClick || (() => {})}
        onCanvasPreviewClick={onCanvasPreviewClick}
      />

      {/* CRITICAL FIX: Only show loading when generating AND no preview exists */}
      <StyleCardLoadingOverlay
        isBlinking={isBlinking && isGenerating && !previewUrl}
        styleName={style.name}
        error={error}
      />

      {/* Blur overlay - pass blinking state */}
      <StyleCardBlurOverlay
        shouldBlur={shouldBlur}
        isBlinking={isBlinking && !previewUrl} // Don't blur if preview exists
        previewUrl={previewUrl}
        styleName={style.name}
        onGenerateStyle={onGenerateStyle || (() => {})}
      />

      {/* Error retry overlay */}
      {showError && onRetry && (
        <StyleCardRetryOverlay
          hasError={showError}
          error={error}
          styleName={style.name}
          onRetry={onRetry}
        />
      )}
    </div>
  );
};

export default StyleCardImage;
