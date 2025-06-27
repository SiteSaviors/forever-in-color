
import { memo } from "react";
import { Sparkles, Crown, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  // Calculate AI match score (mock data for demonstration)
  const getAIMatchScore = (styleId: number) => {
    const matchScores: { [key: number]: number } = {
      1: 0,  // Original Image - no AI match
      2: 85,
      4: 78,
      5: 92,
      6: 89,
      7: 83,
      8: 76,
      9: 92,
      10: 88,
      11: 94,
      13: 81,
      15: 87
    };
    return matchScores[styleId] || 85;
  };

  const aiMatchScore = getAIMatchScore(style.id);
  const showAIMatch = aiMatchScore > 0 && !hasGeneratedPreview && !isGenerating;

  return (
    <div className="relative group">
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

      {/* Top Indicators */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
        <div className="flex flex-col gap-2">
          {/* AI Pick Badge - Only show if this is a recommended style */}
          {aiMatchScore >= 90 && showAIMatch && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg animate-pulse">
              <Crown className="w-3 h-3 mr-1" />
              AI Pick
            </Badge>
          )}
          {/* Popular Badge - Only show if popular and not AI Pick */}
          {isPopular && !(aiMatchScore >= 90 && showAIMatch) && (
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
      </div>

      {/* Bottom AI Match Indicator - Only show on hover and when not generated */}
      {showAIMatch && (
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{aiMatchScore}% Match</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(aiMatchScore / 20)
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              {aiMatchScore >= 90 ? "Perfect match! This style complements your photo beautifully" :
               aiMatchScore >= 80 ? "Great match! This style works well with your photo" :
               "Good match! This style will enhance your photo"}
            </p>
          </div>
        </div>
      )}

      {/* Standard Indicators */}
      <StyleCardIndicators
        isPopular={false} // We handle popular badge above
        showGeneratedBadge={showGeneratedBadge}
        isSelected={isSelected}
        hasPreviewOrCropped={hasPreviewOrCropped}
        onExpandClick={onExpandClick || (() => {})}
        onCanvasPreviewClick={onCanvasPreviewClick}
      />

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
