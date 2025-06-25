
import { useState } from "react";
import StyleCardImage from "./StyleCardImage";
import StyleCardInfo from "./StyleCardInfo";
import StyleCardContainer from "./StyleCardContainer";
import StyleCardErrorState from "./StyleCardErrorState";
import Lightbox from "@/components/ui/lightbox";
import FullCanvasMockup from "./FullCanvasMockup";
import { useSimplifiedStyleCard } from "../hooks/useSimplifiedStyleCard";
import { useStyleCardContext } from "../contexts/StyleCardContext";

interface SimplifiedStyleCardProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  isPopular: boolean;
}

const SimplifiedStyleCard = ({
  style,
  isPopular
}: SimplifiedStyleCardProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCanvasLightboxOpen, setIsCanvasLightboxOpen] = useState(false);

  // Get shared context with preview URLs
  const {
    selectedOrientation,
    croppedImage,
    selectedStyle,
    shouldBlur,
    previewUrls,
    autoGenerationComplete,
    onStyleClick,
    onContinue
  } = useStyleCardContext();

  // Use simplified hook with preview URLs
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
    handleClick,
    handleRetry,
    handleContinueClick,
    handleGenerateStyle
  } = useSimplifiedStyleCard({
    style,
    croppedImage,
    selectedStyle,
    shouldBlur,
    previewUrls, // Pass preview URLs from context
    autoGenerationComplete,
    onStyleClick,
    onContinue
  });

  const cropAspectRatio = selectedOrientation === 'vertical' ? 3/4 : 
                         selectedOrientation === 'horizontal' ? 4/3 : 1;

  // Lightbox handlers
  const handleExpandClick = () => {
    if (previewUrl || croppedImage) {
      setIsLightboxOpen(true);
    }
  };

  const handleCanvasPreviewClick = () => {
    if (previewUrl || croppedImage) {
      setIsCanvasLightboxOpen(true);
    }
  };

  return (
    <>
      <StyleCardContainer
        isSelected={isSelected}
        styleId={style.id}
        onClick={handleClick}
        shouldBlur={shouldShowBlur}
      >
        {/* Hero Image Section */}
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
            onGenerateStyle={handleGenerateStyle}
            onRetry={handleRetry}
          />
          
          {/* Error State Overlay */}
          {showError && error && (
            <StyleCardErrorState
              error={error}
              styleName={style.name}
              onRetry={handleRetry}
              onSkip={croppedImage ? () => handleClick() : undefined}
              retryCount={0}
              maxRetries={3}
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
            onGenerateClick={handleGenerateStyle}
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

export default SimplifiedStyleCard;
