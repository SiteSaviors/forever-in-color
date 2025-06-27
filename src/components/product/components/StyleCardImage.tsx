
import { memo } from "react";
import UnifiedImageDisplay from "./UnifiedImageDisplay";
import StyleCardLoadingOverlay from "./StyleCardLoadingOverlay";
import StyleCardBlurOverlay from "./StyleCardBlurOverlay";
import StyleCardRetryOverlay from "./StyleCardRetryOverlay";
import StyleCardIndicators from "./StyleCardIndicators";

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

const StyleCardImage = memo(({
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

      {/* Small AI Match indicator - only on recommended cards on hover */}
      {isPopular && !hasGeneratedPreview && !isGenerating && !showError && style.id !== 1 && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              <span>92% Match</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay - only show when actively generating */}
      <StyleCardLoadingOverlay
        isBlinking={isGenerating && !previewUrl}
        styleName={style.name}
        error={error}
      />

      {/* Blur overlay */}
      <StyleCardBlurOverlay
        shouldBlur={shouldBlur}
        isBlinking={false}
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
});

StyleCardImage.displayName = 'StyleCardImage';

export default StyleCardImage;
