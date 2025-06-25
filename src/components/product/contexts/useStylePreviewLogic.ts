
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

/**
 * useStylePreviewLogic Hook
 * 
 * Core business logic for AI-powered style preview generation with caching and optimization.
 * This hook encapsulates the complete workflow from user request to final watermarked preview.
 * 
 * Key Features:
 * - Intelligent caching to prevent redundant AI generations
 * - Image optimization for faster processing
 * - Comprehensive error handling with graceful degradation
 * - Watermarking with fallback strategies
 * - Memory management for large images
 * 
 * Workflow:
 * 1. Validate input requirements (image, style selection)
 * 2. Check cache for existing preview
 * 3. Optimize image if needed for AI processing
 * 4. Generate style preview via AI service
 * 5. Apply watermark with fallback on failure
 * 6. Cache result for future requests
 * 7. Update UI state via dispatch
 * 
 * Performance Optimizations:
 * - Cache lookups prevent duplicate AI calls
 * - Image compression reduces processing time
 * - Memory monitoring prevents browser crashes
 * - Async/await patterns prevent UI blocking
 */
export const useStylePreviewLogic = ({
  croppedImage,
  selectedOrientation,
  dispatch
}: UseStylePreviewLogicProps) => {
  
  /**
   * Main preview generation function with comprehensive caching and error handling
   * 
   * @param styleId - Unique identifier for the artistic style
   * @param styleName - Human-readable name for the style (for logging/UI)
   * 
   * Process Flow:
   * 1. Input validation and early returns
   * 2. Cache lookup with aspect ratio consideration
   * 3. Image optimization for AI processing
   * 4. AI generation with comprehensive error handling
   * 5. Watermarking with graceful fallback
   * 6. Cache storage for future requests
   * 7. State updates via reducer dispatch
   */
  const generatePreview = useCallback(async (styleId: number, styleName: string) => {
    // Early validation: Ensure we have a cropped image to work with
    if (!croppedImage) {
      console.error('❌ Cannot generate preview: no cropped image');
      return;
    }

    // Special case: Skip generation for "Original Image" style (ID: 1)
    // This style shows the user's original photo without AI transformation
    if (styleId === 1) {
      console.log('⏭️ Skipping generation for Original Image style');
      return;
    }

    /**
     * Cache Strategy:
     * Generate unique cache key based on:
     * - Source image content (croppedImage hash)
     * - Style ID for transformation type
     * - Aspect ratio for output dimensions
     * 
     * This ensures cache hits for identical requests while preventing
     * cache misses due to orientation changes.
     */
    const aspectRatio = getAspectRatio(selectedOrientation);
    
    // Check cache first to avoid redundant AI calls
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
      
      // Update UI to show loading state
      dispatch({ type: 'START_GENERATION', styleId });
      
      /**
       * Image Optimization:
       * Optimize the cropped image for AI processing to:
       * - Reduce processing time
       * - Minimize memory usage
       * - Prevent timeouts on large images
       * - Maintain acceptable quality
       */
      const optimizedImage = await memoryManager.optimizeForPreview(croppedImage);
      
      // Generate unique temporary ID for this generation request
      const tempPhotoId = `temp_${Date.now()}_${styleId}`;
      
      // Log generation parameters for debugging and monitoring
      console.log(`📋 Generation parameters:`, {
        styleName,
        styleId,
        aspectRatio,
        selectedOrientation,
        originalSizeMB: memoryManager.getImageSizeMB(croppedImage).toFixed(2),
        optimizedSizeMB: memoryManager.getImageSizeMB(optimizedImage).toFixed(2)
      });
      
      /**
       * AI Style Generation:
       * Call the style preview API with optimized parameters
       * This is the core AI transformation step that applies the artistic style
       */
      const previewUrl = await generateStylePreview(
        optimizedImage, 
        styleName, 
        tempPhotoId, 
        aspectRatio
      );

      if (previewUrl) {
        try {
          /**
           * Watermarking Strategy:
           * Apply client-side watermark to protect generated content
           * Fallback to original if watermarking fails to ensure user experience
           */
          const watermarkedUrl = await addWatermarkToImage(previewUrl);
          
          // Cache the successful result with watermark
          previewCache.cachePreview(
            croppedImage, 
            styleId, 
            styleName, 
            aspectRatio, 
            watermarkedUrl
          );
          
          // Update UI with final watermarked result
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: watermarkedUrl 
          });
          
          console.log(`✅ Generation completed and cached for ${styleName}`);
          
        } catch (watermarkError) {
          /**
           * Watermark Fallback Strategy:
           * If watermarking fails, use the original AI-generated image
           * This ensures users still see their preview even if watermarking has issues
           */
          console.warn(`⚠️ Watermark failed for ${styleName}, using original:`, watermarkError);
          
          // Cache even without watermark to avoid regeneration
          previewCache.cachePreview(
            croppedImage, 
            styleId, 
            styleName, 
            aspectRatio, 
            previewUrl
          );
          
          // Update UI with non-watermarked result
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: previewUrl 
          });
        }
      }
    } catch (error) {
      /**
       * Comprehensive Error Handling:
       * Capture and report all generation failures with context
       * Update UI to show error state with retry options
       */
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
