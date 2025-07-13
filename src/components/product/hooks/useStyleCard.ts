
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStylePreview } from './useStylePreview';

interface UseStyleCardProps {
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
  selectedOrientation?: string;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue: () => void;
}

export const useStyleCard = ({
  style,
  croppedImage,
  selectedStyle,
  isPopular = false,
  preGeneratedPreview,
  selectedOrientation = "square",
  onStyleClick,
  onContinue
}: UseStyleCardProps) => {
  // State from useStyleCardLogic
  const [showError, setShowError] = useState(false);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPermanentlyGenerated, setIsPermanentlyGenerated] = useState(false);

  // Style preview hook
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

  // Computed values from useStyleCardLogic
  const isSelected = selectedStyle === style.id;
  const showGeneratedBadge = hasGeneratedPreview && isStyleGenerated;
  const hasError = showError || validationError;
  const imageToShow = previewUrl || croppedImage || style.image;
  
  // CRITICAL: Once permanently generated, NEVER allow any loading states
  const effectiveIsLoading = isPermanentlyGenerated ? false : (isLoading || localIsLoading);

  // Effects from useStyleCardEffects
  
  // SIMPLIFIED: Track generation but allow retry on errors
  useEffect(() => {
    if (previewUrl) {
      console.log(`✅ StyleCard: ${style.name} generated successfully`);
      setLocalIsLoading(false);
      setShowError(false);
    }
  }, [previewUrl, style.name]);

  // Handlers from useStyleCardHandlers
  
  // Main card click handler
  const handleCardClick = useCallback(() => {
    console.log(`🎯 StyleCard clicked: ${style.name}, isPermanentlyGenerated: ${isPermanentlyGenerated}, isGenerating: ${effectiveIsLoading}`);
    
    // Always call onStyleClick to select the style
    onStyleClick(style);
    
    // Auto-generate if no preview and conditions are met
    if (!previewUrl && !effectiveIsLoading && !hasError && style.id !== 1) {
      console.log(`🚀 Auto-generating preview for ${style.name}`);
      handleGenerateClick();
    } else {
      console.log(`📋 Generation check - previewUrl: ${!!previewUrl}, isLoading: ${effectiveIsLoading}, hasError: ${hasError}, styleId: ${style.id}`);
    }
  }, [style, previewUrl, isPermanentlyGenerated, effectiveIsLoading, hasError, onStyleClick]);

  // Continue button handler
  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🎯 Continue clicked for style: ${style.name}`);
    onContinue();
  };

  // Image expand handler
  const handleImageExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🔍 Expanding image for style: ${style.name}`);
    setIsLightboxOpen(true);
  };

  // Generate click handler with enhanced logging
  const handleGenerateClick = useCallback(async () => {
    
    console.log(`🎨 GENERATE BUTTON CLICKED - ${style.name} (ID: ${style.id})`);
    console.log(`  - isPermanentlyGenerated: ${isPermanentlyGenerated}`);
    console.log(`  - effectiveIsLoading: ${effectiveIsLoading}`);
    console.log(`  - hasError: ${hasError}`);
    console.log(`  - croppedImage: ${!!croppedImage}`);
    
    // Skip Original Image style
    if (style.id === 1) {
      console.log(`🚫 SKIP - Original Image style cannot be generated`);
      return;
    }
    
    if (effectiveIsLoading) {
      console.log(`🚫 BUSY BLOCK - ${style.name} is already generating`);
      return;
    }
    
    if (!croppedImage) {
      console.log(`🚫 NO IMAGE BLOCK - ${style.name} has no cropped image`);
      return;
    }
    
    console.log(`🚀 STARTING GENERATION for ${style.name}`);
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      console.log(`📞 CALLING generatePreview() for ${style.name}`);
      await generatePreview();
      console.log(`✅ Generation completed for ${style.name}`);
    } catch (error) {
      console.error(`❌ Generation failed for ${style.name}:`, error);
      setShowError(true);
    } finally {
      console.log(`🏁 Generation finished for ${style.name}, setting loading to false`);
      setLocalIsLoading(false);
    }
  }, [generatePreview, isPermanentlyGenerated, effectiveIsLoading, style.name, style.id, hasError, croppedImage]);

  // Retry click handler
  const handleRetryClick = useCallback(async () => {
    
    // Skip Original Image style
    if (style.id === 1) {
      console.log(`🚫 SKIP - Original Image style cannot be retried`);
      return;
    }
    
    if (effectiveIsLoading) {
      console.log(`🚫 BUSY BLOCK - ${style.name} is already generating`);
      return;
    }
    
    console.log(`🔄 Retrying generation for ${style.name}`);
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      await generatePreview();
      console.log(`✅ Retry completed for ${style.name}`);
    } catch (error) {
      console.log(`❌ Retry failed for ${style.name}:`, error);
      setShowError(true);
    } finally {
      setLocalIsLoading(false);
    }
  }, [generatePreview, isPermanentlyGenerated, effectiveIsLoading, style.name]);

  // Memoize style comparison for better performance
  const isSelectedMemo = useMemo(() => selectedStyle === style.id, [selectedStyle, style.id]);

  return {
    // State
    showError,
    setShowError,
    localIsLoading,
    setLocalIsLoading,
    isLightboxOpen,
    setIsLightboxOpen,
    isPermanentlyGenerated,
    setIsPermanentlyGenerated,
    
    // Preview hook values
    isLoading,
    previewUrl,
    hasGeneratedPreview,
    isStyleGenerated,
    validationError,
    handleClick,
    generatePreview,
    
    // Computed values
    isSelected: isSelectedMemo,
    showGeneratedBadge,
    hasError,
    imageToShow,
    effectiveIsLoading,
    
    // Handlers
    handleCardClick,
    handleContinueClick,
    handleImageExpand,
    handleGenerateClick,
    handleRetryClick
  };
};
