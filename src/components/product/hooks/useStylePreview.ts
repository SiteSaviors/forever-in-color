
import { useState, useEffect, useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';
import { getAspectRatio } from '../orientation/utils';
import { useAspectRatioValidator } from '../orientation/hooks/useAspectRatioValidator';

interface UseStylePreviewProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  isPopular: boolean;
  preGeneratedPreview?: string;
  selectedOrientation?: string;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
}

export const useStylePreview = ({
  style,
  croppedImage,
  isPopular,
  preGeneratedPreview,
  selectedOrientation = "square",
  onStyleClick
}: UseStylePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { validateWithRecovery, autoCorrect } = useAspectRatioValidator();

  // Initialize with pre-generated preview if available
  useEffect(() => {
    if (preGeneratedPreview) {
      // Apply watermark to pre-generated preview
      const applyWatermark = async () => {
        try {
          const watermarkedUrl = await addWatermarkToImage(preGeneratedPreview);
          setPreviewUrl(watermarkedUrl);
          setHasGeneratedPreview(true);
        } catch (error) {
          setPreviewUrl(preGeneratedPreview);
          setHasGeneratedPreview(true);
        }
      };
      
      applyWatermark();
    }
  }, [preGeneratedPreview, style.name]);

  const isStyleGenerated = hasGeneratedPreview && !!(preGeneratedPreview || previewUrl);

  const generatePreview = useCallback(async () => {
    if (!croppedImage || style.id === 1 || preGeneratedPreview) {
      return;
    }
    
    // ENHANCED: Use validator with auto-correction
    const correctedOrientation = autoCorrect(selectedOrientation);
    const aspectRatio = getAspectRatio(correctedOrientation);
    
    // ENHANCED: Validate with recovery
    const validation = validateWithRecovery(correctedOrientation, aspectRatio);
    if (!validation.isValid && !validation.correctedValue) {
      const errorMsg = `Aspect ratio validation failed: ${validation.error}`;
      setValidationError(errorMsg);
      return;
    }

    // Use corrected value if validation failed but correction is available
    const finalAspectRatio = validation.correctedValue || aspectRatio;
    
    // Clear any previous validation errors
    setValidationError(null);
    setIsLoading(true);
    
    try {
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      
      // ENHANCED: Generate with validated and potentially corrected aspect ratio
      const rawPreviewUrl = await generateStylePreview(croppedImage, style.name, tempPhotoId, finalAspectRatio, {
        watermark: false // Disable server-side watermarking
      });

      if (rawPreviewUrl) {
        try {
          // Apply client-side watermarking
          const watermarkedUrl = await addWatermarkToImage(rawPreviewUrl);
          setPreviewUrl(watermarkedUrl);
        } catch (watermarkError) {
          setPreviewUrl(rawPreviewUrl);
        }
        
        setHasGeneratedPreview(true);
      }
    } catch (error) {
      setValidationError(`Generation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [croppedImage, style.id, style.name, preGeneratedPreview, selectedOrientation, validateWithRecovery, autoCorrect]);

  const handleClick = useCallback(() => {
    onStyleClick(style);
    
    if (croppedImage && !hasGeneratedPreview && !isLoading && style.id !== 1 && !preGeneratedPreview) {
      generatePreview();
    }
  }, [style, croppedImage, hasGeneratedPreview, isLoading, onStyleClick, generatePreview, preGeneratedPreview, selectedOrientation]);

  return {
    isLoading,
    previewUrl,
    hasGeneratedPreview,
    isStyleGenerated,
    validationError,
    handleClick,
    generatePreview
  };
};
