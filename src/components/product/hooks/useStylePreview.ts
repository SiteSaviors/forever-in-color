
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
          console.log(`✅ Watermark applied to pre-generated preview for ${style.name}`);
        } catch (error) {
          console.warn(`⚠️ Watermarking failed for ${style.name}, using original:`, error);
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
      console.log(`Cannot generate preview for ${style.name}: croppedImage=${!!croppedImage}, styleId=${style.id}, preGenerated=${!!preGeneratedPreview}`);
      return;
    }

    console.log(`🎯 useStylePreview: Selected orientation is: ${selectedOrientation}`);
    
    // ENHANCED: Use validator with auto-correction
    const correctedOrientation = autoCorrect(selectedOrientation);
    const aspectRatio = getAspectRatio(correctedOrientation);
    
    console.log(`🎨 Starting preview generation for style: ${style.name} (ID: ${style.id}) with corrected orientation: ${correctedOrientation} -> aspect ratio: ${aspectRatio}`);
    
    // ENHANCED: Validate with recovery
    const validation = validateWithRecovery(correctedOrientation, aspectRatio);
    if (!validation.isValid && !validation.correctedValue) {
      const errorMsg = `Aspect ratio validation failed: ${validation.error}`;
      console.error(`❌ ${errorMsg}`);
      setValidationError(errorMsg);
      return;
    }

    // Use corrected value if validation failed but correction is available
    const finalAspectRatio = validation.correctedValue || aspectRatio;
    
    // Clear any previous validation errors
    setValidationError(null);
    setIsLoading(true);
    
    try {
      console.log(`🔄 Generating preview for ${style.name} with validated aspect ratio: ${finalAspectRatio} (from orientation: ${correctedOrientation})`);
      
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      
      console.log(`🔥 CRITICAL DEBUG: About to call generateStylePreview with aspectRatio: ${finalAspectRatio}`);
      
      // ENHANCED: Generate with validated and potentially corrected aspect ratio
      const rawPreviewUrl = await generateStylePreview(croppedImage, style.name, tempPhotoId, finalAspectRatio, {
        watermark: false // Disable server-side watermarking
      });

      if (rawPreviewUrl) {
        console.log(`✅ Raw preview generated for ${style.name} with correct aspect ratio ${finalAspectRatio}, applying client-side watermark...`);
        
        try {
          // Apply client-side watermarking
          const watermarkedUrl = await addWatermarkToImage(rawPreviewUrl);
          console.log(`✅ Client-side watermark applied successfully for ${style.name}`);
          setPreviewUrl(watermarkedUrl);
        } catch (watermarkError) {
          console.warn(`⚠️ Client-side watermarking failed for ${style.name}, using original:`, watermarkError);
          setPreviewUrl(rawPreviewUrl);
        }
        
        setHasGeneratedPreview(true);
      } else {
        console.error(`❌ Failed to generate preview for ${style.name}: No preview URL returned`);
      }
    } catch (error) {
      console.error(`❌ Error generating preview for ${style.name}:`, error);
      setValidationError(`Generation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log(`🏁 Preview generation completed for ${style.name} (ID: ${style.id}) with aspect ratio: ${finalAspectRatio}`);
    }
  }, [croppedImage, style.id, style.name, preGeneratedPreview, selectedOrientation, validateWithRecovery, autoCorrect]);

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
