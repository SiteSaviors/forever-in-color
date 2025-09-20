
import { useState, useEffect, useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';
import { getAspectRatio, validateOrientationFlow } from '../orientation/utils';
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
          // Watermark applied to pre-generated preview
        } catch (error) {
          // Watermarking failed, using original
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
      // Cannot generate preview - invalid conditions
      return;
    }

    // useStylePreview with selected orientation
    
    // ENHANCED: Use validator with auto-correction
    const correctedOrientation = autoCorrect(selectedOrientation);
    const aspectRatio = getAspectRatio(correctedOrientation);
    
    // Starting preview generation with corrected orientation
    
    // SIMPLIFIED: Skip frontend validation, let backend handle it
    const finalAspectRatio = aspectRatio;
    
    // Clear any previous validation errors
    setValidationError(null);
    setIsLoading(true);
    
    try {
      // Generating preview with validated aspect ratio
      
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      
      // About to call generateStylePreview
      
      // ENHANCED: Generate with validated and potentially corrected aspect ratio
      const rawPreviewUrl = await generateStylePreview(croppedImage, style.name, tempPhotoId, finalAspectRatio, {
        watermark: false // Disable server-side watermarking
      });

      if (rawPreviewUrl) {
        // Raw preview generated, applying client-side watermark
        
        try {
          // Apply client-side watermarking
          const watermarkedUrl = await addWatermarkToImage(rawPreviewUrl);
          // Client-side watermark applied successfully
          setPreviewUrl(watermarkedUrl);
        } catch (watermarkError) {
          // Client-side watermarking failed, using original
          setPreviewUrl(rawPreviewUrl);
        }
        
        setHasGeneratedPreview(true);
      } else {
        // Failed to generate preview - no URL returned
      }
    } catch (error) {
      // Error generating preview
      setValidationError(`Generation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      // Preview generation completed
    }
  }, [croppedImage, style.id, style.name, preGeneratedPreview, selectedOrientation, validateWithRecovery, autoCorrect]);

  const handleClick = useCallback(() => {
    // Style clicked with orientation
    onStyleClick(style);
    
    if (croppedImage && !hasGeneratedPreview && !isLoading && style.id !== 1 && !preGeneratedPreview) {
      // Auto-generating preview for style
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
