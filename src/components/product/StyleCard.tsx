
import { useState } from "react";
import StyleCardImage from "./components/StyleCardImage";
import StyleCardInfo from "./components/StyleCardInfo";
import StyleCardContainer from "./components/StyleCardContainer";
import StyleCardActions from "./components/StyleCardActions";
import StyleCardErrorState from "./components/StyleCardErrorState";
import Lightbox from "@/components/ui/lightbox";
import FullCanvasMockup from "./components/FullCanvasMockup";
import { useEnhancedStyleCardLogic } from "./hooks/useEnhancedStyleCardLogic";

interface StyleCardProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  isPopular: boolean;
  selectedOrientation?: string;
  showContinueButton?: boolean;
  shouldBlur?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

const StyleCard = ({
  style,
  croppedImage,
  selectedStyle,
  isPopular,
  selectedOrientation = "square",
  showContinueButton = true,
  shouldBlur = false,
  onStyleClick,
  onContinue
}: StyleCardProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCanvasLightboxOpen, setIsCanvasLightboxOpen] = useState(false);

  const {
    isSelected,
    isGenerating,
    hasGeneratedPreview,
    previewUrl,
    error,
    showError,
    imageToShow,
    showContinueInCard,
    hasPreviewOrCropped,
    showGeneratedBadge,
    shouldShowBlur,
    retryCount,
    maxRetries,
    watermarkResult,
    handleClick,
    handleRetry,
    handleSkip,
    handleContinueClick,
    generatePreview
  } = useEnhancedStyleCardLogic({
    style,
    croppedImage,
    selectedStyle,
    shouldBlur,
    onStyleClick,
    onContinue
  });

  const cropAspectRatio = selectedOrientation === 'vertical' ? 3/4 : 
                         selectedOrientation === 'horizontal' ? 4/3 : 1;

  // Handle expand click for lightbox
  const handleExpandClick = () => {
    if (previewUrl || croppedImage) {
      setIsLightboxOpen(true);
    }
  };

  // Handle canvas preview click
  const handleCanvasPreviewClick = () => {
    if (previewUrl || croppedImage) {
      setIsCanvasLightboxOpen(true);
    }
  };

  console.log(`StyleCard ${style.name} (ID: ${style.id}):`, {
    isSelected,
    isGenerating,
    hasGeneratedPreview,
    showGeneratedBadge,
    shouldBlur,
    shouldShowBlur,
    showError,
    retryCount,
    hasPreview: !!previewUrl,
    croppedImage: !!croppedImage,
    watermarkSuccess: watermarkResult?.success
  });

  // Get action handlers
  const actions = StyleCardActions({
    style,
    onStyleClick,
    onContinue
  });

  return (
    <>
      <StyleCardContainer
        isSelected={isSelected}
        styleId={style.id}
        onClick={handleClick}
        shouldBlur={shouldShowBlur}
      >
        {/* Hero Image Section with Enhanced Error Handling */}
        <div className="flex-shrink-0 relative touch-manipulation">
          <StyleCardImage
            style={style}
            imageToShow={imageToShow}
            cropAspectRatio={cropAspectRatio}
            showLoadingState={isGenerating}
            isPopular={isPopular}
            showGeneratedBadge={showGeneratedBadge}
            isSelected={isSelected}
            hasPreviewOrCropped={hasPreviewOrCropped}
            shouldBlur={shouldShowBlur}
            isGenerating={isGenerating}
            showError={showError}
            error={error}
            selectedOrientation={selectedOrientation}
            previewUrl={previewUrl}
            hasGeneratedPreview={hasGeneratedPreview}
            onExpandClick={handleExpandClick}
            onCanvasPreviewClick={handleCanvasPreviewClick}
            onGenerateStyle={generatePreview}
            onRetry={handleRetry}
          />
          
          {/* Enhanced Error State Overlay */}
          {showError && error && (
            <StyleCardErrorState
              error={error}
              styleName={style.name}
              onRetry={handleRetry}
              onSkip={croppedImage ? handleSkip : undefined}
              retryCount={retryCount}
              maxRetries={maxRetries}
            />
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col p-3 md:p-4 touch-manipulation">
          <StyleCardInfo
            style={style}
            hasGeneratedPreview={hasGeneratedPreview}
            isPopular={isPopular}
            isSelected={isSelected}
            showGeneratedBadge={showGeneratedBadge}
            showContinueInCard={showContinueInCard}
            shouldBlur={shouldShowBlur}
            showError={showError}
            onContinueClick={handleContinueClick}
            onGenerateClick={actions.handleGenerateClick}
            onRetryClick={handleRetry}
          />
        </div>
      </StyleCardContainer>

      {/* Lightboxes */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageSrc={previewUrl || croppedImage || ''}
        imageAlt={`${style.name} preview`}
        title={style.name}
      />

      <Lightbox
        isOpen={isCanvasLightboxOpen}
        onClose={() => setIsCanvasLightboxOpen(false)}
        imageSrc=""
        imageAlt={`${style.name} canvas preview`}
        title={`${style.name} on Canvas`}
        customContent={
          <FullCanvasMockup
            imageUrl={previewUrl || croppedImage || ''}
            orientation={selectedOrientation}
            styleName={style.name}
          />
        }
      />
    </>
  );
};

export default StyleCard;
