
import React, { memo, useMemo } from 'react';
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

const StyleCard = memo(({
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
  // Memoize style comparison for better performance
  const isSelected = useMemo(() => selectedStyle === style.id, [selectedStyle, style.id]);
  
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

  // Convert hasError to boolean and extract error message before passing to handlers
  const hasErrorBoolean = Boolean(hasError);
  const errorMessage = typeof hasError === 'string' ? hasError : (validationError || 'Generation failed');

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
    hasError: hasErrorBoolean,
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

  // Enhanced visual feedback for permanently generated state
  const isLocked = isPermanentlyGenerated;
  const showLockedFeedback = isLocked && !isSelected;

  return (
    <>
      <StyleCardContainer
        isSelected={isSelected}
        styleId={style.id}
        styleName={style.name}
        shouldBlur={shouldBlur}
        isGenerating={effectiveIsLoading}
        hasError={hasErrorBoolean}
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
          
          {/* Subtle locked state indicator */}
          {showLockedFeedback && (
            <div className="absolute top-2 right-2 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              ✓ Generated
            </div>
          )}
          
          {/* Loading Overlay - CRITICAL: Never show if permanently generated */}
          {!isPermanentlyGenerated && (
            <EnhancedStyleCardLoadingOverlay
              isBlinking={false}
              styleName={style.name}
              isLoading={effectiveIsLoading}
              error={hasErrorBoolean ? errorMessage : null}
              onRetry={() => handleRetryClick({} as React.MouseEvent)}
            />
          )}
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
          showError={hasErrorBoolean}
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
});

StyleCard.displayName = 'StyleCard';

export default StyleCard;
