
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
      // StyleCard generated successfully
      setLocalIsLoading(false);
      setShowError(false);
    }
  }, [previewUrl, style.name]);

  // Handlers from useStyleCardHandlers
  
  // Main card click handler
  const handleCardClick = useCallback(() => {
    // StyleCard clicked - handle selection and generation
    
    // Always call onStyleClick to select the style
    onStyleClick(style);
    
    // Auto-generate if no preview and conditions are met
    if (!previewUrl && !effectiveIsLoading && !hasError && style.id !== 1) {
      // Auto-generating preview
      handleGenerateClick();
    }
  }, [style, previewUrl, isPermanentlyGenerated, effectiveIsLoading, hasError, onStyleClick]);

  // Continue button handler
  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Continue clicked for style
    onContinue();
  };

  // Image expand handler
  const handleImageExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Expanding image for style
    setIsLightboxOpen(true);
  };

  // Generate click handler with enhanced logging
  const handleGenerateClick = useCallback(async () => {
    
    // Generate button clicked - validate and start generation
    
    // Skip Original Image style
    if (style.id === 1) {
      return;
    }
    
    if (effectiveIsLoading) {
      return;
    }
    
    if (!croppedImage) {
      return;
    }
    
    // Starting generation
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      await generatePreview();
      // Generation completed
    } catch (error) {
      setShowError(true);
    } finally {
      setLocalIsLoading(false);
    }
  }, [generatePreview, isPermanentlyGenerated, effectiveIsLoading, style.name, style.id, hasError, croppedImage]);

  // Retry click handler
  const handleRetryClick = useCallback(async () => {
    
    // Skip Original Image style
    if (style.id === 1) {
      return;
    }
    
    if (effectiveIsLoading) {
      return;
    }
    
    // Retrying generation
    setShowError(false);
    setLocalIsLoading(true);
    
    try {
      await generatePreview();
      // Retry completed
    } catch (error) {
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
