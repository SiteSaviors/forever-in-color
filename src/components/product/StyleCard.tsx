import { useState } from "react";
import StyleCardImage from "./components/StyleCardImage";
import StyleCardInfo from "./components/StyleCardInfo";
import StyleCardContainer from "./components/StyleCardContainer";
import StyleCardActions from "./components/StyleCardActions";
import StyleCardLightboxes from "./components/StyleCardLightboxes";
import Lightbox from "@/components/ui/lightbox";
import FullCanvasMockup from "./components/FullCanvasMockup";
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

const StyleCard = ({
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
    // Fix the Promise<void> vs Promise<string> issue by wrapping the function
    generatePreview: async () => {
      await generatePreview(style.id, style.name);
      return getPreviewUrl(style.id) || null;
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

  return (
    <>
      <StyleCardContainer
        isSelected={isSelected}
        styleId={style.id}
        onClick={handleClick}
        shouldBlur={shouldShowBlur}
        hideBlurOverlay={shouldBlur && !isPopular && style.id !== 1}
      >
        {/* Hero Image Section - Make this prominent on mobile */}
        <div className="flex-shrink-0 relative">
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
            shouldBlur={shouldShowBlur}
            showError={showError}
            onContinueClick={handleContinueClick}
            onGenerateClick={actions.handleGenerateClick}
            onRetryClick={handleRetry}
          />
        </div>
      </StyleCardContainer>

      <StyleCardLightboxes
        style={style}
        finalPreviewUrl={previewUrl}
        croppedImage={croppedImage}
        selectedOrientation={selectedOrientation}
        onExpandClick={handleExpandClick}
        onCanvasPreviewClick={handleCanvasPreviewClick}
      />

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
