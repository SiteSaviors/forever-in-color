
import React from "react";
import StyleCardImage from "../StyleCardImage";
import StyleCardInfo from "../StyleCardInfo";

interface StyleCardMainProps {
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
  error: string | null;
  selectedOrientation: string;
  previewUrl: string | null;
  hasGeneratedPreview: boolean;
  showContinueInCard: boolean;
  onExpandClick: () => void;
  onCanvasPreviewClick: () => void;
  onGenerateStyle: () => void;
  onRetry: () => void;
  onContinueClick: () => void;
  onGenerateClick: () => void;
  onRetryClick: () => void;
}

const StyleCardMain = React.memo(({
  style,
  imageToShow,
  cropAspectRatio,
  isPopular,
  showGeneratedBadge,
  isSelected,
  hasPreviewOrCropped,
  shouldBlur,
  isGenerating,
  showError,
  error,
  hasGeneratedPreview,
  showContinueInCard,
  onExpandClick,
  onContinueClick,
  onGenerateClick,
  onRetryClick
}: StyleCardMainProps) => {
  return (
    <>
      {/* Hero Image Section - Make this prominent on mobile */}
      <div className="flex-shrink-0 relative">
        <StyleCardImage
          style={style}
          imageToShow={imageToShow}
          cropAspectRatio={cropAspectRatio}
          onImageExpand={onExpandClick}
        />
      </div>

      {/* Info Section - Streamlined for mobile */}
      <div className="flex-1 flex flex-col">
        <StyleCardInfo
          style={style}
          hasGeneratedPreview={hasGeneratedPreview}
          isPopular={isPopular}
          isSelected={isSelected}
          showGeneratedBadge={showGeneratedBadge}
          showContinueInCard={showContinueInCard}
          shouldBlur={shouldBlur}
          showError={showError}
          onContinueClick={onContinueClick}
          onGenerateClick={onGenerateClick}
          onRetryClick={onRetryClick}
        />
      </div>
    </>
  );
});

StyleCardMain.displayName = 'StyleCardMain';

export default StyleCardMain;
