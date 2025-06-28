
import React, { memo, useMemo } from 'react';
import { useBlinking } from './hooks/useBlinking';
import { useStyleCardLogic } from './hooks/useStyleCardLogic';
import { useStyleCardEffects } from './hooks/useStyleCardEffects';
import { useStyleCardHandlers } from './hooks/useStyleCardHandlers';
import { useTouchOptimizedInteractions } from './hooks/useTouchOptimizedInteractions';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import StyleCardContainer from './components/StyleCardContainer';
import StyleCardInfo from './components/StyleCardInfo';
import StyleCardErrorBoundary from './components/StyleCardErrorBoundary';
import ProgressiveStyleImage from './components/ProgressiveStyleImage';
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
  // Performance monitoring
  usePerformanceMonitor(`StyleCard-${style.name}`, process.env.NODE_ENV === 'development');

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

  // Create wrapper functions that match the expected signatures (no parameters)
  const handleGenerateWrapper = () => handleGenerateClick({} as React.MouseEvent);
  const handleRetryWrapper = () => handleRetryClick({} as React.MouseEvent);

  // Touch-optimized interactions
  const { isPressed, touchHandlers } = useTouchOptimizedInteractions({
    onTap: handleCardClick,
    onLongPress: handleImageExpand
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
    <StyleCardErrorBoundary styleId={style.id} styleName={style.name}>
      <StyleCardContainer
        isSelected={isSelected}
        styleId={style.id}
        styleName={style.name}
        shouldBlur={shouldBlur}
        isGenerating={effectiveIsLoading}
        hasError={hasErrorBoolean}
        canAccess={!!croppedImage}
        onClick={handleCardClick}
        onGenerateStyle={handleGenerateWrapper}
      >
        <div 
          {...touchHandlers}
          className={`performance-container ${isPressed ? 'scale-95' : ''} transition-transform duration-100`}
        >
          {/* Image Section with Progressive Loading */}
          <div className="relative flex-1">
            <ProgressiveStyleImage
              src={imageToShow}
              alt={style.name}
              aspectRatio={cropAspectRatio || 1}
              className="transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform"
              priority={isPopular || isSelected}
              onLoad={() => console.log(`Image loaded: ${style.name}`)}
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
                onRetry={handleRetryWrapper}
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
            onGenerateClick={handleGenerateWrapper}
            onRetryClick={handleRetryWrapper}
          />
        </div>
      </StyleCardContainer>

      {/* Lightbox for image expansion - always available */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageSrc={imageToShow}
        imageAlt={`${style.name} preview`}
        title={style.name}
      />
    </StyleCardErrorBoundary>
  );
});

StyleCard.displayName = 'StyleCard';

export default StyleCard;
