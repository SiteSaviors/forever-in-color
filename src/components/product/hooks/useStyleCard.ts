import { useState, useCallback, useEffect } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { useDebounce } from './useDebounce';
import { getAspectRatio } from '../orientation/utils';

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
  // Simplified state management - idle → loading → success/error
  const [isLoading, setIsLoading] = useState(false);
  const [isStyleGenerated, setIsStyleGenerated] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preGeneratedPreview || null);
  const [hasError, setHasError] = useState<string | boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Simplified error tracking
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const isSelected = selectedStyle === style.id;
  const isPermanentlyGenerated = !!preGeneratedPreview;
  const showGeneratedBadge = isPopular && isStyleGenerated;
  const hasGeneratedPreview = !!previewUrl && isStyleGenerated;

  // Use debounced loading state to prevent flickering
  const effectiveIsLoading = useDebounce(isLoading, 300);

  const handleCardClick = () => {
    if (!isPermanentlyGenerated) {
      onStyleClick(style);
    }
  };

  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContinue();
  };

  const handleImageExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLightboxOpen(true);
  };

  // Reset all error states before attempting generation
  const resetErrorState = useCallback(() => {
    console.log(`🔄 Resetting error state for ${style.name}`);
    setHasError(false);
    setValidationError(null);
    setLastError(null);
  }, [style.name]);

  // FIXED: Simplified validation - only check for essential requirements
  const validateGenerationState = useCallback(() => {
    if (!croppedImage) {
      console.log(`❌ Validation failed for ${style.name}: No image available`);
      return false;
    }
    
    if (isLoading) {
      console.log(`❌ Validation failed for ${style.name}: Already loading`);
      return false;
    }
    
    // REMOVED: isPermanentlyGenerated check that was causing immediate "Try Again"
    // Allow regeneration even if previously generated
    
    console.log(`✅ Validation passed for ${style.name}`);
    return true;
  }, [croppedImage, isLoading, style.name]);

  const handleGenerateClick = useCallback(async (e: React.MouseEvent) => {
    e?.stopPropagation();
    console.log(`🎨 Generate clicked for style: ${style.id} (${style.name})`);
    
    // Validate state before proceeding
    if (!validateGenerationState()) {
      return;
    }

    // Reset errors and start loading - simple state flow
    resetErrorState();
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
    
    console.log(`🚀 Starting generation attempt ${retryCount + 1} for ${style.name}`);
    
    try {
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const aspectRatio = getAspectRatio(selectedOrientation);
      
      console.log('📋 Generation parameters:', {
        styleName: style.name,
        orientation: selectedOrientation,
        aspectRatio,
        photoId,
        hasImage: !!croppedImage
      });
      
      const generatedPreviewUrl = await generateStylePreview(
        croppedImage,
        style.name,
        photoId,
        aspectRatio
      );

      if (generatedPreviewUrl) {
        console.log('✅ Generation successful for', style.name);
        setPreviewUrl(generatedPreviewUrl);
        setIsStyleGenerated(true);
        // Auto-select the style after successful generation
        onStyleClick(style);
      } else {
        throw new Error('No preview URL returned from generation service');
      }
    } catch (error) {
      console.error('❌ Generation failed for', style.name, ':', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate style preview';
      setHasError(errorMessage);
      setValidationError(errorMessage);
      setLastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [style, croppedImage, selectedOrientation, onStyleClick, retryCount, validateGenerationState, resetErrorState]);

  const handleRetryClick = useCallback(async (e: React.MouseEvent) => {
    e?.stopPropagation();
    console.log(`🔄 Retry clicked for style: ${style.id} (${style.name})`);
    
    // Simple retry - just call generate again (it will reset state internally)
    await handleGenerateClick(e);
  }, [handleGenerateClick, style]);

  const imageToShow = previewUrl || style.image;

  // Comprehensive state logging for debugging
  console.log(`🔍 StyleCard State [${style.name}]:`, {
    state: isLoading ? 'loading' : hasError ? 'error' : isStyleGenerated ? 'generated' : 'idle',
    isSelected,
    hasError: !!hasError,
    errorMessage: hasError,
    isLoading,
    isPermanentlyGenerated,
    isStyleGenerated,
    hasPreviewUrl: !!previewUrl,
    retryCount,
    canGenerate: !!croppedImage && !isPermanentlyGenerated && !isLoading
  });

  return {
    isSelected,
    isLoading,
    effectiveIsLoading,
    isStyleGenerated,
    previewUrl,
    hasError,
    validationError,
    isPermanentlyGenerated,
    isLightboxOpen,
    setIsLightboxOpen,
    handleCardClick,
    handleContinueClick,
    handleGenerateClick,
    handleRetryClick,
    handleImageExpand,
    imageToShow,
    isPopular,
    showGeneratedBadge,
    hasGeneratedPreview,
    retryCount,
    lastError
  };
};
