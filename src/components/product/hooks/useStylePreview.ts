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
      setPreviewUrl(preGeneratedPreview);
      setHasGeneratedPreview(true);
    }
  }, [preGeneratedPreview]);

  const isStyleGenerated = hasGeneratedPreview && !!(preGeneratedPreview || previewUrl);

  const generatePreview = useCallback(async () => {
    if (!croppedImage || style.id === 1) {
      console.log(`⏭️ Skipping generation for ${style.id === 1 ? 'Original Image style' : 'no cropped image'}`);
      return;
    }

    try {
      console.log(`🎨 Starting manual generation for ${style.name} (ID: ${style.id})`);
      console.log(`🎯 Selected orientation: ${selectedOrientation}`);
      setIsLoading(true);
      setValidationError(null);
      
      // ENHANCED: Auto-correct orientation and get aspect ratio
      const correctedOrientation = autoCorrect(selectedOrientation);
      const aspectRatio = getAspectRatio(correctedOrientation);
      
      // ENHANCED: Validate with recovery and correction
      const validation = validateWithRecovery(correctedOrientation, aspectRatio);
      if (!validation.isValid && !validation.correctedValue) {
        const errorMsg = `Aspect ratio validation failed: ${validation.error}`;
        console.error(`❌ ${errorMsg}`);
        setValidationError(errorMsg);
        setIsLoading(false);
        return;
      }

      // Use corrected value if available
      const finalAspectRatio = validation.correctedValue || aspectRatio;
      
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      
      console.log(`📋 Generation parameters:`, {
        styleName: style.name,
        styleId: style.id,
        originalOrientation: selectedOrientation,
        correctedOrientation,
        mappedAspectRatio: finalAspectRatio,
        croppedImageLength: croppedImage.length,
        validationPassed: validation.isValid || !!validation.correctedValue
      });
      
      console.log(`🔥 CRITICAL DEBUG: Calling generateStylePreview with validated aspect ratio: ${finalAspectRatio} for orientation: ${correctedOrientation}`);
      
      // ENHANCED: Generate with validated and potentially corrected aspect ratio
      const previewUrl = await generateStylePreview(
        croppedImage, 
        style.name, 
        tempPhotoId, 
        finalAspectRatio // This is now validated and potentially corrected
      );

      if (previewUrl) {
        try {
          const watermarkedUrl = await addWatermarkToImage(previewUrl);
          setPreviewUrl(watermarkedUrl);
          setHasGeneratedPreview(true);
          console.log(`✅ Manual generation completed for ${style.name} with validated aspect ratio: ${finalAspectRatio}`);
        } catch (watermarkError) {
          console.warn(`⚠️ Watermark failed for ${style.name}, using original:`, watermarkError);
          setPreviewUrl(previewUrl);
          setHasGeneratedPreview(true);
        }
      }
    } catch (error) {
      console.error(`❌ Error generating preview for ${style.name}:`, error);
      setValidationError(error.message || 'Failed to generate preview');
    } finally {
      setIsLoading(false);
    }
  }, [croppedImage, style, selectedOrientation, validateWithRecovery, autoCorrect]);

  const handleClick = useCallback(() => {
    console.log(`🎯 Style clicked: ${style.name} (ID: ${style.id}) with orientation: ${selectedOrientation}`);
    onStyleClick(style);
    
    if (croppedImage && !hasGeneratedPreview && !isLoading && style.id !== 1 && !preGeneratedPreview) {
      console.log(`🚀 Auto-generating preview for style: ${style.name} with orientation ${selectedOrientation}`);
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