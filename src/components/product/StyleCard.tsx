
import React, { useState, useCallback, useEffect } from 'react';
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
  const [localIsLoading, setLocalIsLoading] = useState(false);

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

  // CRITICAL FIX: Stop loading immediately when preview is available
  useEffect(() => {
    if (previewUrl) {
      console.log(`🛑 StyleCard: Preview available for ${style.name}, stopping loading state`);
      setLocalIsLoading(false);
    }
  }, [previewUrl, style.name]);

  // Combine loading states - stop loading if we have a preview
  const effectiveIsLoading = previewUrl ? false : (isLoading || localIsLoading);

  const isSelected = selectedStyle === style.id;
  const showGeneratedBadge = hasGeneratedPreview && isStyleGenerated;
  const showContinueInCard = showContinueButton && isSelected && isStyleGenerated;
  const hasError = showError || validationError;

  // Determine what image to show - preview URL if available, otherwise cropped image, otherwise default style image
  const imageToShow = previewUrl || croppedImage || style.image;

  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContinue();
  };

  const handleGenerateClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      await generatePreview();
    } catch (error) {
      setShowError(true);
    } finally {
      // Only set loading to false if we don't have a preview yet
      if (!previewUrl) {
        setLocalIsLoading(false);
      }
    }
  }, [generatePreview, previewUrl]);

  const handleRetryClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      await generatePreview();
    } catch (error) {
      setShowError(true);
    } finally {
      // Only set loading to false if we don't have a preview yet
      if (!previewUrl) {
        setLocalIsLoading(false);
      }
    }
  }, [generatePreview, previewUrl]);

  return (
    <StyleCardContainer
      isSelected={isSelected}
      styleId={style.id}
      styleName={style.name}
      shouldBlur={shouldBlur}
      isGenerating={effectiveIsLoading}
      hasError={!!hasError}
      canAccess={!!croppedImage}
      onClick={handleClick}
      onGenerateStyle={() => handleGenerateClick({} as React.MouseEvent)}
    >
      {/* Image Section */}
      <div className="relative flex-1">
        <StyleCardImage
          style={style}
          imageToShow={imageToShow}
          cropAspectRatio={cropAspectRatio}
        />
        
        {/* Enhanced Loading Overlay */}
        <EnhancedStyleCardLoadingOverlay
          isBlinking={effectiveIsLoading}
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
