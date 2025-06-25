
import { useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';
import { StylePreviewAction } from './types';
import { getAspectRatio } from './orientationUtils';
import { previewCache } from '@/utils/previewCache';
import { memoryManager } from '@/utils/memoryManager';

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
  // Enhanced generation function with caching
  const generatePreview = useCallback(async (styleId: number, styleName: string) => {
    if (!croppedImage) {
      console.error('❌ Cannot generate preview: no cropped image');
      return;
    }

    if (styleId === 1) {
      console.log('⏭️ Skipping generation for Original Image style');
      return;
    }

    const aspectRatio = getAspectRatio(selectedOrientation);
    
    // Check cache first
    const cachedPreview = previewCache.getCachedPreview(croppedImage, styleId, aspectRatio);
    if (cachedPreview) {
      dispatch({ 
        type: 'GENERATION_SUCCESS', 
        styleId, 
        url: cachedPreview 
      });
      console.log(`✅ Using cached preview for ${styleName}`);
      return;
    }

    try {
      console.log(`🎨 Starting generation for ${styleName} (ID: ${styleId})`);
      dispatch({ type: 'START_GENERATION', styleId });
      
      // Optimize image for preview generation
      const optimizedImage = await memoryManager.optimizeForPreview(croppedImage);
      
      const tempPhotoId = `temp_${Date.now()}_${styleId}`;
      
      console.log(`📋 Generation parameters:`, {
        styleName,
        styleId,
        aspectRatio,
        selectedOrientation,
        originalSizeMB: memoryManager.getImageSizeMB(croppedImage).toFixed(2),
        optimizedSizeMB: memoryManager.getImageSizeMB(optimizedImage).toFixed(2)
      });
      
      const previewUrl = await generateStylePreview(
        optimizedImage, 
        styleName, 
        tempPhotoId, 
        aspectRatio
      );

      if (previewUrl) {
        try {
          const watermarkedUrl = await addWatermarkToImage(previewUrl);
          
          // Cache the result
          previewCache.cachePreview(
            croppedImage, 
            styleId, 
            styleName, 
            aspectRatio, 
            watermarkedUrl
          );
          
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: watermarkedUrl 
          });
          
          console.log(`✅ Generation completed and cached for ${styleName}`);
        } catch (watermarkError) {
          console.warn(`⚠️ Watermark failed for ${styleName}, using original:`, watermarkError);
          
          // Cache even without watermark
          previewCache.cachePreview(
            croppedImage, 
            styleId, 
            styleName, 
            aspectRatio, 
            previewUrl
          );
          
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: previewUrl 
          });
        }
      }
    } catch (error) {
      console.error(`❌ Generation failed for ${styleName}:`, error);
      dispatch({ 
        type: 'GENERATION_ERROR', 
        styleId, 
        error: error.message 
      });
    }
  }, [croppedImage, selectedOrientation, dispatch]);

  return { generatePreview };
};
