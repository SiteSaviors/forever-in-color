
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
      console.log(`🎯 CRITICAL: Selected orientation before mapping: ${selectedOrientation}`);
      dispatch({ type: 'START_GENERATION', styleId });
      
      // CRITICAL FIX: Map orientation to correct aspect ratio BEFORE API call
      const aspectRatio = getAspectRatio(selectedOrientation);
      const tempPhotoId = `temp_${Date.now()}_${styleId}`;
      
      console.log(`📋 Generation parameters:`, {
        styleName,
        styleId,
        selectedOrientation,
        mappedAspectRatio: aspectRatio,
        croppedImageLength: croppedImage.length
      });
      
      console.log(`🔥 CRITICAL: Calling generateStylePreview with aspect ratio: ${aspectRatio} for orientation: ${selectedOrientation}`);
      
      const previewUrl = await generateStylePreview(
        croppedImage, 
        styleName, 
        tempPhotoId, 
        aspectRatio // This should now be "4:3", "3:4", or "1:1"
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
