
import React, { useState, useCallback, useEffect } from 'react';
import { useStylePreview } from './hooks/useStylePreview';
import StyleCardContainer from './components/StyleCardContainer';
import StyleCardInfo from './components/StyleCardInfo';
import StyleCardImage from './components/StyleCardImage';
import EnhancedStyleCardLoadingOverlay from './components/EnhancedStyleCardLoadingOverlay';
import StyleCardRetryOverlay from './components/StyleCardRetryOverlay';
import Lightbox from '@/components/ui/lightbox';
import { useBlinking } from './hooks/useBlinking';

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

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

  // Track if this style has been generated before - PERMANENT STATE
  useEffect(() => {
    if (previewUrl && !hasGeneratedOnce) {
      console.log(`🎯 StyleCard: Marking ${style.name} as PERMANENTLY generated`);
      setHasGeneratedOnce(true);
      setLocalIsLoading(false); // Stop any local loading immediately
    }
  }, [previewUrl, hasGeneratedOnce, style.name]);

  // CRITICAL: Stop loading immediately when preview is available
  useEffect(() => {
    if (previewUrl || hasGeneratedOnce) {
      console.log(`🛑 StyleCard: Preview available or already generated for ${style.name}, stopping all loading states`);
      setLocalIsLoading(false);
    }
  }, [previewUrl, hasGeneratedOnce, style.name]);

  // Use the updated blinking hook with permanent state tracking
  const { isBlinking } = useBlinking(previewUrl, {
    isGenerating: hasGeneratedOnce ? false : (isLoading || localIsLoading),
    hasPreview: !!previewUrl,
    hasGeneratedOnce
  });

  // NEVER show loading if we have a preview OR if we've generated once
  const effectiveIsLoading = (previewUrl || hasGeneratedOnce) ? false : (isLoading || localIsLoading);

  const isSelected = selectedStyle === style.id;
  const showGeneratedBadge = hasGeneratedPreview && isStyleGenerated;
  const showContinueInCard = showContinueButton && isSelected && (isStyleGenerated || hasGeneratedOnce);
  const hasError = showError || validationError;

  // Determine what image to show - preview URL if available, otherwise cropped image, otherwise default style image
  const imageToShow = previewUrl || croppedImage || style.image;

  // SOLUTION 1: Prevent regeneration if style already has a preview OR has been generated once
  const handleCardClick = useCallback(() => {
    console.log(`🎯 StyleCard clicked: ${style.name}, hasPreview: ${!!previewUrl}, hasGeneratedOnce: ${hasGeneratedOnce}, isGenerating: ${effectiveIsLoading}`);
    
    // Always call onStyleClick to select the style
    onStyleClick(style);
    
    // NEVER generate if we've already generated once OR if we have a preview
    if (hasGeneratedOnce || previewUrl) {
      console.log(`🛑 PERMANENT STOP - ${style.name} already generated, will never generate again`);
      return;
    }
    
    // Only generate if we don't already have a preview AND haven't generated once AND not currently generating
    if (!previewUrl && !hasGeneratedOnce && !effectiveIsLoading && !hasError && style.id !== 1) {
      console.log(`🚀 Auto-generating preview for ${style.name} (first and only time)`);
      handleGenerateClick({} as React.MouseEvent);
    }
  }, [style, previewUrl, hasGeneratedOnce, effectiveIsLoading, hasError, onStyleClick]);

  // SOLUTION 3: Make continue button navigate to next step
  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🎯 Continue clicked for style: ${style.name}`);
    onContinue();
  };

  // SOLUTION 2: Add image expansion functionality
  const handleImageExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🔍 Expanding image for style: ${style.name}`);
    setIsLightboxOpen(true);
  };

  const handleGenerateClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // NEVER generate if we've already generated once OR have a preview
    if (hasGeneratedOnce || previewUrl) {
      console.log(`🛑 PERMANENT BLOCK - ${style.name} already generated, preventing regeneration`);
      return;
    }
    
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      await generatePreview();
      setHasGeneratedOnce(true); // Mark as permanently generated
    } catch (error) {
      setShowError(true);
    } finally {
      // Only set loading to false if we don't have a preview yet
      if (!previewUrl) {
        setLocalIsLoading(false);
      }
    }
  }, [generatePreview, previewUrl, hasGeneratedOnce, style.name]);

  const handleRetryClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      await generatePreview();
      setHasGeneratedOnce(true); // Mark as permanently generated
    } catch (error) {
      setShowError(true);
    } finally {
      // Only set loading to false if we don't have a preview yet
      if (!previewUrl) {
        setLocalIsLoading(false);
      }
    }
  }, [generatePreview, previewUrl, style.name]);

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
          
          {/* Enhanced Loading Overlay */}
          <EnhancedStyleCardLoadingOverlay
            isBlinking={isBlinking}
            styleName={style.name}
            error={hasError ? (validationError || 'Generation failed') : null}
            onRetry={() => handleRetryClick({} as React.MouseEvent)}
          />
        </div>

        {/* Info Section */}
        <StyleCardInfo
          style={style}
          hasGeneratedPreview={hasGeneratedPreview || hasGeneratedOnce}
          isPopular={isPopular}
          isSelected={isSelected}
          showGeneratedBadge={showGeneratedBadge || hasGeneratedOnce}
          showContinueInCard={showContinueInCard}
          shouldBlur={shouldBlur}
          showError={!!hasError}
          onContinueClick={handleContinueClick}
          onGenerateClick={handleGenerateClick}
          onRetryClick={handleRetryClick}
        />
      </StyleCardContainer>

      {/* SOLUTION 2: Lightbox for image expansion */}
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
