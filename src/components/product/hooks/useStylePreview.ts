
import { useState, useEffect, useCallback } from 'react';
import { watermarkManager } from '@/utils/watermarkManager';
import { getAspectRatio } from '../orientation/utils';
import { useAspectRatioValidator } from '../orientation/hooks/useAspectRatioValidator';
import { generateAndWatermarkPreview } from '@/utils/previewGeneration';

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
  isPopular: _isPopular,
  preGeneratedPreview,
  selectedOrientation = "square",
  onStyleClick
}: UseStylePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { autoCorrect } = useAspectRatioValidator();

  // Initialize with pre-generated preview if available
  useEffect(() => {
    if (preGeneratedPreview) {
      // Apply watermark to pre-generated preview using Web Worker
      const applyWatermark = async () => {
        try {
          const watermarkedUrl = await watermarkManager.addWatermark(preGeneratedPreview);
          setPreviewUrl(watermarkedUrl);
          setHasGeneratedPreview(true);
          // Watermark applied to pre-generated preview
        } catch (_error) {
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
    // Re-entrancy guard: prevent concurrent generations
    if (isLoading || !croppedImage || style.id === 1 || preGeneratedPreview) {
      return;
    }

    // Use validator with auto-correction
    const correctedOrientation = autoCorrect(selectedOrientation);
    const aspectRatio = getAspectRatio(correctedOrientation);

    // Clear any previous validation errors
    setValidationError(null);
    setIsLoading(true);

    try {
      // Use shared generation function
      const { previewUrl: generatedUrl } = await generateAndWatermarkPreview(
        croppedImage,
        style.name,
        style.id,
        aspectRatio,
        { watermark: false, persistToDb: false }
      );

      setPreviewUrl(generatedUrl);
      setHasGeneratedPreview(true);
    } catch (error) {
      setValidationError(`Generation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [croppedImage, style.id, style.name, preGeneratedPreview, selectedOrientation, autoCorrect, isLoading]);

  const handleClick = useCallback(() => {
    // Style clicked with orientation
    onStyleClick(style);
    
    if (croppedImage && !hasGeneratedPreview && !isLoading && style.id !== 1 && !preGeneratedPreview) {
      // Auto-generating preview for style
      generatePreview();
    }
  }, [style, croppedImage, hasGeneratedPreview, isLoading, onStyleClick, generatePreview, preGeneratedPreview]);

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
