
import React, { useState, useCallback } from 'react';
import { useStylePreview } from './hooks/useStylePreview';
import StyleCardContainer from './components/StyleCardContainer';
import StyleCardInfo from './components/StyleCardInfo';
import StyleCardImage from './components/StyleCardImage';
import EnhancedStyleCardLoadingOverlay from './components/EnhancedStyleCardLoadingOverlay';
import StyleCardRetryOverlay from './components/StyleCardRetryOverlay';

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
  const [showError, setShowError] = useState(false);

  const {
    isLoading,
    previewUrl,
    hasGeneratedPreview,
    isStyleGenerated,
    validationError,
    handleClick,
    generatePreview
  } = useStylePreview({
    style,
    croppedImage,
    isPopular,
    preGeneratedPreview,
    selectedOrientation,
    onStyleClick
  });

  const isSelected = selectedStyle === style.id;
  const showGeneratedBadge = hasGeneratedPreview && isStyleGenerated;
  const showContinueInCard = showContinueButton && isSelected && isStyleGenerated;
  const hasError = showError || validationError;

  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContinue();
  };

  const handleGenerateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowError(false);
    generatePreview().catch(() => {
      setShowError(true);
    });
  }, [generatePreview]);

  const handleRetryClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowError(false);
    generatePreview().catch(() => {
      setShowError(true);
    });
  }, [generatePreview]);

  return (
    <StyleCardContainer
      isSelected={isSelected}
      styleId={style.id}
      styleName={style.name}
      shouldBlur={shouldBlur}
      isGenerating={isLoading}
      hasError={!!hasError}
      canAccess={!!croppedImage}
      onClick={handleClick}
      onGenerateStyle={() => handleGenerateClick({} as React.MouseEvent)}
    >
      {/* Image Section */}
      <div className="relative flex-1">
        <StyleCardImage
          style={style}
          previewUrl={previewUrl}
          aspectRatio={cropAspectRatio}
        />
        
        {/* Enhanced Loading Overlay */}
        <EnhancedStyleCardLoadingOverlay
          isBlinking={isLoading}
          styleName={style.name}
          error={hasError ? (validationError || 'Generation failed') : null}
          onRetry={() => handleRetryClick({} as React.MouseEvent)}
        />
      </div>

      {/* Info Section */}
      <StyleCardInfo
        style={style}
        hasGeneratedPreview={hasGeneratedPreview}
        isPopular={isPopular}
        isSelected={isSelected}
        showGeneratedBadge={showGeneratedBadge}
        showContinueInCard={showContinueInCard}
        shouldBlur={shouldBlur}
        showError={!!hasError}
        onContinueClick={handleContinueClick}
        onGenerateClick={handleGenerateClick}
        onRetryClick={handleRetryClick}
      />
    </StyleCardContainer>
  );
};

export default StyleCard;
