
import { useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';
import { StylePreviewAction } from './types';
import { getAspectRatio, validateOrientationFlow } from '../orientation/utils';

interface UseStylePreviewLogicProps {
  croppedImage: string | null;
  selectedOrientation: string;
  dispatch: React.Dispatch<StylePreviewAction>;
}

export const useStylePreviewLogic = ({
  croppedImage,
  selectedOrientation,
  dispatch
}: UseStylePreviewLogicProps) => {
  // Manual generation function
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
      
      // STEP 1: Get aspect ratio using consolidated mapping
      const aspectRatio = getAspectRatio(selectedOrientation);
      
      // STEP 2: Validate the mapping before API call
      const validation = validateOrientationFlow(selectedOrientation, aspectRatio);
      if (!validation.isValid) {
        const errorMsg = `Aspect ratio validation failed: ${validation.error}`;
        console.error(`❌ ${errorMsg}`);
        dispatch({ 
          type: 'GENERATION_ERROR', 
          styleId, 
          error: errorMsg 
        });
        return;
      }
      
      const tempPhotoId = `temp_${Date.now()}_${styleId}`;
      
      console.log(`📋 Generation parameters:`, {
        styleName,
        styleId,
        selectedOrientation,
        mappedAspectRatio: aspectRatio,
        croppedImageLength: croppedImage.length,
        validationPassed: validation.isValid
      });
      
      console.log(`🔥 CRITICAL DEBUG: Calling generateStylePreview with validated aspect ratio: ${aspectRatio} for orientation: ${selectedOrientation}`);
      
      // STEP 3: Generate with validated aspect ratio  
      const previewUrl = await generateStylePreview(
        croppedImage, 
        styleName, 
        tempPhotoId, 
        aspectRatio // This is now validated to be correct
      );

      if (previewUrl) {
        try {
          const watermarkedUrl = await addWatermarkToImage(previewUrl);
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: watermarkedUrl 
          });
          console.log(`✅ Manual generation completed for ${styleName} with validated aspect ratio: ${aspectRatio}`);
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
        error: error.message 
      });
    }
  }, [croppedImage, selectedOrientation, dispatch]);

  return { generatePreview };
};
