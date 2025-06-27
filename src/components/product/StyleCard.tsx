
import React from 'react';
import { useBlinking } from './hooks/useBlinking';
import { useStyleCardLogic } from './hooks/useStyleCardLogic';
import { useStyleCardEffects } from './hooks/useStyleCardEffects';
import { useStyleCardHandlers } from './hooks/useStyleCardHandlers';
import StyleCardContainer from './components/StyleCardContainer';
import StyleCardInfo from './components/StyleCardInfo';
import StyleCardImage from './components/StyleCardImage';
import EnhancedStyleCardLoadingOverlay from './components/EnhancedStyleCardLoadingOverlay';
import Lightbox from '@/components/ui/lightbox';

interface StyleCardProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  isPopular?: boolean;
  preGeneratedPreview?: string;
  cropAspectRatio?: number;
  selectedOrientation?: string;
  showContinueButton?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue: () => void;
  shouldBlur?: boolean;
}

const StyleCard = ({
  style,
  croppedImage,
  selectedStyle,
  isPopular = false,
  preGeneratedPreview,
  cropAspectRatio,
  selectedOrientation = "square",
  showContinueButton = true,
  onStyleClick,
  onContinue,
  shouldBlur = false
}: StyleCardProps) => {
  // Use the logic hook for state management
  const {
    showError,
    setShowError,
    localIsLoading,
    setLocalIsLoading,
    isLightboxOpen,
    setIsLightboxOpen,
    isPermanentlyGenerated,
    setIsPermanentlyGenerated,
    previewUrl,
    hasGeneratedPreview,
    isStyleGenerated,
    validationError,
    generatePreview,
    isSelected,
    showGeneratedBadge,
    hasError,
    imageToShow,
    effectiveIsLoading
  } = useStyleCardLogic({
    style,
    croppedImage,
    selectedStyle,
    isPopular,
    preGeneratedPreview,
    selectedOrientation,
    onStyleClick
  });

  // Use the effects hook for side effects
  useStyleCardEffects({
    previewUrl,
    preGeneratedPreview,
    isPermanentlyGenerated,
    setIsPermanentlyGenerated,
    setLocalIsLoading,
    styleName: style.name
  });

  // Use the handlers hook for event handling
  const {
    handleCardClick,
    handleContinueClick,
    handleImageExpand,
    handleGenerateClick,
    handleRetryClick
  } = useStyleCardHandlers({
    style,
    previewUrl,
    isPermanentlyGenerated,
    effectiveIsLoading,
    hasError,
    setShowError,
    setLocalIsLoading,
    setIsLightboxOpen,
    onStyleClick,
    onContinue,
    generatePreview
  });

  const { isBlinking } = useBlinking(previewUrl, {
    isGenerating: isPermanentlyGenerated ? false : (effectiveIsLoading),
    hasPreview: !!previewUrl,
    hasGeneratedOnce: isPermanentlyGenerated
  });

  const showContinueInCard = showContinueButton && isSelected && (isStyleGenerated || isPermanentlyGenerated);

  return (
    <>
      <StyleCardContainer
        isSelected={isSelected}
        styleId={style.id}
        styleName={style.name}
        shouldBlur={shouldBlur}
        isGenerating={effectiveIsLoading}
        hasError={!!hasError}
        canAccess={!!croppedImage}
        onClick={handleCardClick}
        onGenerateStyle={() => handleGenerateClick({} as React.MouseEvent)}
      >
        {/* Image Section */}
        <div className="relative flex-1">
          <StyleCardImage
            style={style}
            imageToShow={imageToShow}
            cropAspectRatio={cropAspectRatio}
            onImageExpand={handleImageExpand}
          />
          
          {/* Loading Overlay - Never show if permanently generated */}
          <EnhancedStyleCardLoadingOverlay
            isBlinking={false}
            styleName={style.name}
            isLoading={effectiveIsLoading}
            error={hasError ? (validationError || 'Generation failed') : null}
            onRetry={() => handleRetryClick({} as React.MouseEvent)}
          />
        </div>

        {/* Info Section */}
        <StyleCardInfo
          style={style}
          hasGeneratedPreview={hasGeneratedPreview || isPermanentlyGenerated}
          isPopular={isPopular}
          isSelected={isSelected}
          showGeneratedBadge={showGeneratedBadge || isPermanentlyGenerated}
          showContinueInCard={showContinueInCard}
          shouldBlur={shouldBlur}
          showError={!!hasError}
          onContinueClick={handleContinueClick}
          onGenerateClick={handleGenerateClick}
          onRetryClick={handleRetryClick}
        />
      </StyleCardContainer>

      {/* Lightbox for image expansion - always available */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageSrc={imageToShow}
        imageAlt={`${style.name} preview`}
        title={style.name}
      />
    </>
  );
};

export default StyleCard;
