
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
  const [isPermanentlyGenerated, setIsPermanentlyGenerated] = useState(false);

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

  // Track permanent generation state - once generated, never allow regeneration
  useEffect(() => {
    if (previewUrl && !isPermanentlyGenerated) {
      console.log(`🔒 StyleCard: Permanently locking ${style.name} - will never regenerate again`);
      setIsPermanentlyGenerated(true);
      setLocalIsLoading(false);
    }
  }, [previewUrl, isPermanentlyGenerated, style.name]);

  // Initialize permanent state if pre-generated preview exists
  useEffect(() => {
    if (preGeneratedPreview && !isPermanentlyGenerated) {
      console.log(`🔒 StyleCard: ${style.name} has pre-generated preview - marking as permanently generated`);
      setIsPermanentlyGenerated(true);
    }
  }, [preGeneratedPreview, isPermanentlyGenerated, style.name]);

  // Stop all loading states immediately when permanently generated
  useEffect(() => {
    if (isPermanentlyGenerated) {
      console.log(`🛑 StyleCard: ${style.name} is permanently generated, stopping all loading states`);
      setLocalIsLoading(false);
    }
  }, [isPermanentlyGenerated, style.name]);

  const { isBlinking } = useBlinking(previewUrl, {
    isGenerating: isPermanentlyGenerated ? false : (isLoading || localIsLoading),
    hasPreview: !!previewUrl,
    hasGeneratedOnce: isPermanentlyGenerated
  });

  // Never show loading if permanently generated
  const effectiveIsLoading = isPermanentlyGenerated ? false : (isLoading || localIsLoading);

  const isSelected = selectedStyle === style.id;
  const showGeneratedBadge = hasGeneratedPreview && isStyleGenerated;
  const showContinueInCard = showContinueButton && isSelected && (isStyleGenerated || isPermanentlyGenerated);
  const hasError = showError || validationError;

  // Determine what image to show - preview URL if available, otherwise cropped image, otherwise default style image
  const imageToShow = previewUrl || croppedImage || style.image;

  // MAIN SOLUTION: Prevent any generation after permanent generation
  const handleCardClick = useCallback(() => {
    console.log(`🎯 StyleCard clicked: ${style.name}, isPermanentlyGenerated: ${isPermanentlyGenerated}, isGenerating: ${effectiveIsLoading}`);
    
    // Always call onStyleClick to select the style
    onStyleClick(style);
    
    // CRITICAL: Never generate if permanently generated
    if (isPermanentlyGenerated) {
      console.log(`🚫 PERMANENT BLOCK - ${style.name} is permanently generated, no action taken`);
      return;
    }
    
    // Only generate if we don't have a preview AND not permanently generated AND not currently generating
    if (!previewUrl && !effectiveIsLoading && !hasError && style.id !== 1) {
      console.log(`🚀 Auto-generating preview for ${style.name} (first time)`);
      handleGenerateClick({} as React.MouseEvent);
    }
  }, [style, previewUrl, isPermanentlyGenerated, effectiveIsLoading, hasError, onStyleClick]);

  // Continue button handler
  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🎯 Continue clicked for style: ${style.name}`);
    onContinue();
  };

  // Image expand handler - always available
  const handleImageExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🔍 Expanding image for style: ${style.name}`);
    setIsLightboxOpen(true);
  };

  const handleGenerateClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // CRITICAL: Never generate if permanently generated
    if (isPermanentlyGenerated) {
      console.log(`🚫 PERMANENT BLOCK - ${style.name} cannot be regenerated`);
      return;
    }
    
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      await generatePreview();
      // Don't set permanent state here - let the useEffect handle it when previewUrl is available
    } catch (error) {
      setShowError(true);
    } finally {
      // Only set loading to false if not permanently generated
      if (!isPermanentlyGenerated) {
        setLocalIsLoading(false);
      }
    }
  }, [generatePreview, isPermanentlyGenerated, style.name]);

  const handleRetryClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // CRITICAL: Never retry if permanently generated
    if (isPermanentlyGenerated) {
      console.log(`🚫 PERMANENT BLOCK - ${style.name} cannot be retried`);
      return;
    }
    
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      await generatePreview();
    } catch (error) {
      setShowError(true);
    } finally {
      if (!isPermanentlyGenerated) {
        setLocalIsLoading(false);
      }
    }
  }, [generatePreview, isPermanentlyGenerated, style.name]);

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
