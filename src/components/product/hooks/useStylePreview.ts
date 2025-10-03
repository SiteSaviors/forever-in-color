
import { useState, useEffect, useCallback } from 'react';
import { generateStylePreview, fetchPreviewStatus } from '@/utils/stylePreviewApi';
import { watermarkManager } from '@/utils/watermarkManager';
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

  const pollPreviewStatusUntilReady = useCallback(async (requestId: string) => {
    const maxAttempts = 30;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const status = await fetchPreviewStatus(requestId);
      const normalized = status.status?.toLowerCase();

      if ((normalized === 'succeeded' || normalized === 'complete') && status.preview_url) {
        return status.preview_url as string;
      }

      if (normalized === 'failed' || normalized === 'error') {
        throw new Error(status.error || 'Preview generation failed');
      }

      attempt += 1;
      const wait = Math.min(4000, 500 + attempt * 250);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    throw new Error('Preview generation timed out');
  }, []);

  const generatePreview = useCallback(async () => {
    // Re-entrancy guard: prevent concurrent generations
    if (isLoading || !croppedImage || style.id === 1 || preGeneratedPreview) {
      // Cannot generate preview - already loading or invalid conditions
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
      const generationResult = await generateStylePreview(croppedImage, style.name, tempPhotoId, finalAspectRatio, {
        watermark: false // Disable server-side watermarking
      });

      let rawPreviewUrl: string | null = null;

      if (generationResult.status === 'complete') {
        rawPreviewUrl = generationResult.previewUrl;
      } else if (generationResult.status === 'processing') {
        rawPreviewUrl = await pollPreviewStatusUntilReady(generationResult.requestId);
      }

      if (rawPreviewUrl) {
        // Raw preview generated, applying client-side watermark using Web Worker

        try {
          // Apply client-side watermarking via Web Worker
          const watermarkedUrl = await watermarkManager.addWatermark(rawPreviewUrl);
          // Client-side watermark applied successfully
          setPreviewUrl(watermarkedUrl);
        } catch (_watermarkError) {
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
  }, [croppedImage, style.id, style.name, preGeneratedPreview, selectedOrientation, autoCorrect, pollPreviewStatusUntilReady]);

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
