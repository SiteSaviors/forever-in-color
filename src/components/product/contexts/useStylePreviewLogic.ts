
import { useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';
import { convertOrientationToAspectRatio } from '../utils/orientationDetection';

export const useStylePreviewLogic = (croppedImage: string | null, selectedOrientation: string) => {
  const generatePreviewForStyle = useCallback(async (styleId: number, styleName: string) => {
    if (!croppedImage) {
      console.error('Cannot generate preview: no image uploaded');
      return null;
    }

    try {
      // Skip generation for Original Image style
      if (styleId === 1) {
        console.log('Skipping generation for Original Image style');
        return croppedImage;
      }

      console.log(`Generating preview for ${styleName} with orientation ${selectedOrientation}`);
      
      // Use the correct aspect ratio format for the API
      const aspectRatio = convertOrientationToAspectRatio(selectedOrientation);
      
      const tempPhotoId = `temp_${Date.now()}_${styleId}`;
      
      const previewUrl = await generateStylePreview(
        croppedImage, 
        styleName, 
        tempPhotoId, 
        aspectRatio
      );
      
      if (previewUrl) {
        try {
          // Apply client-side watermark
          const watermarkedUrl = await addWatermarkToImage(previewUrl);
          return watermarkedUrl;
        } catch (watermarkError) {
          console.warn(`Watermark failed for ${styleName}, using original:`, watermarkError);
          return previewUrl;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error generating preview for ${styleName}:`, error);
      throw error;
    }
  }, [croppedImage, selectedOrientation]);

  return {
    generatePreviewForStyle
  };
};
