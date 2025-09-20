
import { memo } from 'react';
import { useStyleCardHooks } from './hooks/useStyleCardHooks';
import StyleCardSimplified from './components/StyleCardSimplified';
import StyleCardContent from './components/StyleCardContent';
import StyleCardErrorBoundary from './components/StyleCardErrorBoundary';
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

const StyleCard = memo((props: StyleCardProps) => {
  const {
    style,
    croppedImage,
    isPopular = false,
    cropAspectRatio,
    shouldBlur = false
  } = props;

  // Consolidated hooks
  const {
    // State
    isSelected,
    hasErrorBoolean,
    errorMessage,
    effectiveIsLoading,
    isPermanentlyGenerated,
    isLightboxOpen,
    setIsLightboxOpen,
    hasGeneratedPreview,
    showGeneratedBadge,
    imageToShow,
    showContinueInCard,
    showLockedFeedback,
    
    // Handlers
    handleCardClick,
    handleContinueClick,
    handleGenerateWrapper,
    handleRetryWrapper,
    handleImageExpand,
    
    // Interactions
    isPressed,
    touchHandlers
  } = useStyleCardHooks(props);

  return (
    <StyleCardErrorBoundary styleId={style.id} styleName={style.name}>
      <StyleCardSimplified
        isSelected={isSelected}
        styleId={style.id}
        styleName={style.name}
        shouldBlur={shouldBlur}
        isGenerating={effectiveIsLoading}
        hasError={hasErrorBoolean}
        canAccess={!!croppedImage}
        onClick={handleCardClick}
      >
        <StyleCardContent
          style={style}
          imageToShow={imageToShow}
          cropAspectRatio={cropAspectRatio}
          isPopular={isPopular}
          isSelected={isSelected}
          hasGeneratedPreview={hasGeneratedPreview}
          showGeneratedBadge={showGeneratedBadge}
          showContinueInCard={showContinueInCard}
          shouldBlur={shouldBlur}
          hasErrorBoolean={hasErrorBoolean}
          errorMessage={errorMessage}
          effectiveIsLoading={effectiveIsLoading}
          isPermanentlyGenerated={isPermanentlyGenerated}
          showLockedFeedback={showLockedFeedback}
          touchHandlers={touchHandlers}
          isPressed={isPressed}
          onContinueClick={handleContinueClick}
          onGenerateClick={handleGenerateWrapper}
          onRetryClick={handleRetryWrapper}
          onImageExpand={handleImageExpand}
        />
      </StyleCardSimplified>

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
