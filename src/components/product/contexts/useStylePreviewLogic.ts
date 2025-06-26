
import { useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';
import { StylePreviewAction } from './types';
import { getAspectRatio } from '../orientation/utils';

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
      dispatch({ type: 'START_GENERATION', styleId });
      
      // CRITICAL FIX: Use the correct aspect ratio mapping
      const aspectRatio = getAspectRatio(selectedOrientation);
      const tempPhotoId = `temp_${Date.now()}_${styleId}`;
      
      console.log(`📋 Generation parameters:`, {
        styleName,
        styleId,
        aspectRatio,
        selectedOrientation,
        mappedCorrectly: true
      });
      
      const previewUrl = await generateStylePreview(
        croppedImage, 
        styleName, 
        tempPhotoId, 
        aspectRatio // This now correctly maps orientation to GPT-Image-1 format
      );

      if (previewUrl) {
        try {
          const watermarkedUrl = await addWatermarkToImage(previewUrl);
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: watermarkedUrl 
          });
          console.log(`✅ Manual generation completed for ${styleName} with aspect ratio: ${aspectRatio}`);
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
