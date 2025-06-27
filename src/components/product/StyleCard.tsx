
import { useState, memo } from "react";
import StyleCardContainer from "./components/StyleCardContainer";
import StyleCardActions from "./components/StyleCardActions";
import StyleCardMain from "./components/StyleCard/StyleCardMain";
import StyleCardLightboxContainer from "./components/StyleCard/StyleCardLightboxContainer";
import { useStyleCardLogic } from "./hooks/useStyleCardLogic";
import { useStylePreview } from "./contexts/StylePreviewContext";

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
  cropAspectRatio: number;
  selectedOrientation?: string;
  showContinueButton?: boolean;
  shouldBlur?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

const StyleCard = memo(({
  style,
  croppedImage,
  selectedStyle,
  isPopular,
  cropAspectRatio,
  selectedOrientation = "square",
  showContinueButton = true,
  shouldBlur = false,
  onStyleClick,
  onContinue
}: StyleCardProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCanvasLightboxOpen, setIsCanvasLightboxOpen] = useState(false);
  
  // Get preview generation functionality from context
  const { 
    generatePreview, 
    getPreviewUrl, 
    isLoading, 
    hasPreview, 
    hasError, 
    getError 
  } = useStylePreview();

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
    isBlinking,
    handleClick,
    handleGenerateStyle,
    handleRetry,
    handleContinueClick
  } = useStyleCardLogic({
    style,
    croppedImage,
    selectedStyle,
    shouldBlur,
    onStyleClick,
    onContinue,
    // Fix: Wrap the generatePreview to return the expected type
    generatePreview: async () => {
      await generatePreview(style.id, style.name);
      return getPreviewUrl(style.id) || '';
    },
    getPreviewUrl: () => getPreviewUrl(style.id),
    isLoading: isLoading(style.id),
    hasPreview: hasPreview(style.id),
    hasError: hasError(style.id),
    getError: () => getError(style.id)
  });

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

  // Get action handlers
  const actions = StyleCardActions({
    style,
    onStyleClick,
    onContinue
  });

  // Calculate interaction states
  const canAccess = !shouldShowBlur || isPopular || style.id === 1;

  // Fix: Wrap event handlers to match expected signatures
  const handleGenerateClickWrapper = () => {
    handleGenerateStyle();
  };

  const handleRetryClickWrapper = () => {
    handleRetry();
  };

  const handleContinueClickWrapper = (e?: React.MouseEvent) => {
    // Create a mock event if none provided
    const mockEvent = e || {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as React.MouseEvent;
    handleContinueClick(mockEvent);
  };

  return (
    <>
      <StyleCardContainer
        isSelected={isSelected}
        styleId={style.id}
        styleName={style.name}
        onClick={handleClick}
        shouldBlur={shouldShowBlur}
        hideBlurOverlay={shouldBlur && !isPopular && style.id !== 1}
        isGenerating={isGenerating}
        hasError={showError}
        canAccess={canAccess}
        onGenerateStyle={handleGenerateStyle}
      >
        <StyleCardMain
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
          showContinueInCard={showContinueInCard}
          onExpandClick={handleExpandClick}
          onCanvasPreviewClick={handleCanvasPreviewClick}
          onGenerateStyle={handleGenerateStyle}
          onRetry={handleRetryClickWrapper}
          onContinueClick={handleContinueClickWrapper}
          onGenerateClick={handleGenerateClickWrapper}
          onRetryClick={handleRetryClickWrapper}
        />
      </StyleCardContainer>

      <StyleCardLightboxContainer
        style={style}
        finalPreviewUrl={previewUrl}
        croppedImage={croppedImage}
        selectedOrientation={selectedOrientation}
        isLightboxOpen={isLightboxOpen}
        isCanvasLightboxOpen={isCanvasLightboxOpen}
        onExpandClick={handleExpandClick}
        onCanvasPreviewClick={handleCanvasPreviewClick}
        onCloseLightbox={() => setIsLightboxOpen(false)}
        onCloseCanvasLightbox={() => setIsCanvasLightboxOpen(false)}
      />
    </>
  );
});

StyleCard.displayName = 'StyleCard';

export default StyleCard;
