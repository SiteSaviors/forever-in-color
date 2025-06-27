import { useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';
import { getAspectRatio, validateOrientationFlow } from '../orientation/utils';
import { useAspectRatioValidator } from '../orientation/hooks/useAspectRatioValidator';

interface UseStylePreviewLogicProps {
  croppedImage: string | null;
  selectedOrientation: string;
  dispatch: React.Dispatch<any>;
}

export const useStylePreviewLogic = ({
  croppedImage,
  selectedOrientation,
  dispatch
}: UseStylePreviewLogicProps) => {
  const { validateWithRecovery, autoCorrect } = useAspectRatioValidator();

  // Manual generation function with enhanced validation
  const generatePreview = useCallback(async (styleId: number, styleName: string) => {
    if (!croppedImage) {
      console.error('❌ Cannot generate preview: no cropped image');
      return;
    }

    if (styleId === 1) {
      console.log('⏭️ Skipping generation for Original Image style');
      return;
    }

    try {
      console.log(`🎨 Starting manual generation for ${styleName} (ID: ${styleId})`);
      console.log(`🎯 Selected orientation: ${selectedOrientation}`);
      dispatch({ type: 'START_GENERATION', styleId });
      
      // ENHANCED: Auto-correct orientation and get aspect ratio
      const correctedOrientation = autoCorrect(selectedOrientation);
      const aspectRatio = getAspectRatio(correctedOrientation);
      
      // ENHANCED: Validate with recovery and correction
      const validation = validateWithRecovery(correctedOrientation, aspectRatio);
      if (!validation.isValid && !validation.correctedValue) {
        const errorMsg = `Aspect ratio validation failed: ${validation.error}`;
        console.error(`❌ ${errorMsg}`);
        dispatch({ 
          type: 'GENERATION_ERROR', 
          styleId, 
          error: errorMsg 
        });
        return;
      }

      // Use corrected value if available
      const finalAspectRatio = validation.correctedValue || aspectRatio;
      
      const tempPhotoId = `temp_${Date.now()}_${styleId}`;
      
      console.log(`📋 Generation parameters:`, {
        styleName,
        styleId,
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
        styleName, 
        tempPhotoId, 
        finalAspectRatio // This is now validated and potentially corrected
      );

      if (previewUrl) {
        try {
          const watermarkedUrl = await addWatermarkToImage(previewUrl);
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: watermarkedUrl 
          });
          console.log(`✅ Manual generation completed for ${styleName} with validated aspect ratio: ${finalAspectRatio}`);
        } catch (watermarkError) {
          console.warn(`⚠️ Watermark failed for ${styleName}, using original:`, watermarkError);
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: previewUrl 
          });
        }
      }
    } catch (error) {
      console.error(`❌ Manual generation failed for ${styleName}:`, error);
      dispatch({ 
        type: 'GENERATION_ERROR', 
        styleId, 
        error: error.message || 'Failed to generate preview'
      });
    }
  }, [croppedImage, selectedOrientation, dispatch, validateWithRecovery, autoCorrect]);

  return { generatePreview };
};