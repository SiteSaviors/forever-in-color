import { useState, useCallback, useEffect } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { useDebounce } from './useDebounce';
import { getAspectRatioFromOrientation } from '../orientation/utils';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isStyleGenerated, setIsStyleGenerated] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preGeneratedPreview || null);
  const [hasError, setHasError] = useState<string | boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Enhanced error handling state
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const isSelected = selectedStyle === style.id;
  const isPermanentlyGenerated = !!preGeneratedPreview;
  const showGeneratedBadge = isPopular && isStyleGenerated;

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

  const handleGenerateClick = useCallback(async (e: React.MouseEvent) => {
    e?.stopPropagation();
    console.log(`🎨 Generate clicked for style: ${style.id} (${style.name})`);
    
    if (!croppedImage || isPermanentlyGenerated) {
      console.log('❌ Generate blocked: No image or already generated');
      return;
    }

    // Clear previous errors and start generation
    setHasError(false);
    setValidationError(null);
    setLastError(null);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
    
    try {
      console.log('🚀 Starting style preview generation...', {
        imageUrl: croppedImage.substring(0, 50) + '...',
        styleName: style.name,
        orientation: selectedOrientation,
        retryAttempt: retryCount + 1
      });

      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const aspectRatio = getAspectRatioFromOrientation(selectedOrientation);
      
      const previewUrl = await generateStylePreview(
        croppedImage,
        style.name,
        photoId,
        aspectRatio
      );

      if (previewUrl) {
        console.log('✅ Style preview generated successfully:', previewUrl.substring(0, 50) + '...');
        setPreviewUrl(previewUrl);
        setIsStyleGenerated(true);
        setHasError(false);
        setValidationError(null);
        setLastError(null);
        
        // Auto-select the style after successful generation
        onStyleClick(style);
      } else {
        throw new Error('No preview URL returned from generation service');
      }
    } catch (error) {
      console.error('❌ Style preview generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate style preview';
      setHasError(errorMessage);
      setValidationError(errorMessage);
      setLastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [style, croppedImage, selectedOrientation, isPermanentlyGenerated, onStyleClick, retryCount]);

  const handleRetryClick = useCallback(async (e: React.MouseEvent) => {
    e?.stopPropagation();
    console.log(`🔄 Retry clicked for style: ${style.id} (${style.name}), attempt: ${retryCount + 1}`);
    
    // Reset error state and try again
    setHasError(false);
    setValidationError(null);
    
    // Call the generate function again
    await handleGenerateClick(e);
  }, [handleGenerateClick, style, retryCount]);

  const imageToShow = previewUrl || style.image;

  // Enhanced logging for debugging
  console.log(`🔍 StyleCard State Debug [${style.name}]:`, {
    isSelected,
    hasError: !!hasError,
    isLoading,
    isPermanentlyGenerated,
    isStyleGenerated,
    previewUrl: previewUrl ? previewUrl.substring(0, 50) + '...' : null,
    retryCount,
    lastError
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
    retryCount,
    lastError
  };
};
