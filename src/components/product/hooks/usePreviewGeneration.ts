import { useState, useEffect } from "react";
import { generateStylePreview } from "@/utils/stylePreviewApi";
import { addWatermarkToImage } from "@/utils/watermarkUtils";
import { convertOrientationToAspectRatio } from "../utils/orientationDetection";
import { previewCache, logCachePerformance } from "@/utils/previewCache";
import { memoryManager, logMemoryUsage } from "@/utils/memoryManager";

export const usePreviewGeneration = (uploadedImage: string | null, selectedOrientation: string) => {
  const [previewUrls, setPreviewUrls] = useState<{ [key: number]: string }>({});
  const [autoGenerationComplete, setAutoGenerationComplete] = useState(false);

  // Auto-generate previews for popular styles when cropped image is available
  useEffect(() => {
    if (uploadedImage && !autoGenerationComplete) {
      const popularStyleIds = [2, 4, 5]; // Classic Oil Painting, Watercolor Dreams, Pastel Bliss
      const artStyles = [
        { id: 2, name: "Classic Oil Painting" },
        { id: 4, name: "Watercolor Dreams" },
        { id: 5, name: "Pastel Bliss" }
      ];
      
      const generatePopularPreviews = async () => {
        console.log('🚀 Auto-generating previews for popular styles:', popularStyleIds);
        console.log('Current selected orientation:', selectedOrientation);
        
        const aspectRatio = convertOrientationToAspectRatio(selectedOrientation);
        
        // Optimize image once for all generations
        const optimizedImage = await memoryManager.optimizeForPreview(uploadedImage);
        console.log(`🗜️ Optimized image for batch generation: ${memoryManager.getImageSizeMB(optimizedImage).toFixed(2)}MB`);
        
        for (const styleId of popularStyleIds) {
          const style = artStyles.find(s => s.id === styleId);
          if (!style) continue;

          // Check cache first
          const cachedPreview = previewCache.getCachedPreview(uploadedImage, styleId, aspectRatio);
          if (cachedPreview) {
            setPreviewUrls(prev => ({ ...prev, [styleId]: cachedPreview }));
            console.log(`✅ Using cached preview for ${style.name}`);
            continue;
          }

          try {
            console.log(`🎨 Auto-generating preview for ${style.name} (ID: ${styleId}) with aspect ratio: ${aspectRatio}`);
            
            const tempPhotoId = `temp_${Date.now()}_${styleId}`;
            
            // Generate without server-side watermarking
            const rawPreviewUrl = await generateStylePreview(optimizedImage, style.name, tempPhotoId, aspectRatio, {
              watermark: false // Disable server-side watermarking
            });

            if (rawPreviewUrl) {
              try {
                // Apply client-side watermarking
                const watermarkedUrl = await addWatermarkToImage(rawPreviewUrl);
                
                // Cache the result
                previewCache.cachePreview(
                  uploadedImage, 
                  styleId, 
                  style.name, 
                  aspectRatio, 
                  watermarkedUrl
                );
                
                setPreviewUrls(prev => ({ ...prev, [styleId]: watermarkedUrl }));
                console.log(`✅ Auto-generated preview for ${style.name} completed with client-side watermark and aspect ratio ${aspectRatio}`);
              } catch (watermarkError) {
                console.warn(`⚠️ Failed to add watermark for ${style.name}, using original:`, watermarkError);
                
                // Cache even without watermark
                previewCache.cachePreview(
                  uploadedImage, 
                  styleId, 
                  style.name, 
                  aspectRatio, 
                  rawPreviewUrl
                );
                
                setPreviewUrls(prev => ({ ...prev, [styleId]: rawPreviewUrl }));
              }
            }
          } catch (error) {
            console.error(`❌ Error auto-generating preview for ${style.name}:`, error);
          }
        }
        
        setAutoGenerationComplete(true);
        console.log('🏁 Auto-generation of popular style previews completed');
        
        // Log performance metrics
        logCachePerformance();
        logMemoryUsage();
      };

      generatePopularPreviews();
    }
  }, [uploadedImage, autoGenerationComplete, selectedOrientation]);

  // Reset states when uploaded image changes but preserve previews within session
  useEffect(() => {
    if (!uploadedImage) {
      setAutoGenerationComplete(false);
      setPreviewUrls({});
      // Don't clear cache entirely - keep for session
    }
  }, [uploadedImage]);

  return {
    previewUrls,
    autoGenerationComplete,
    setPreviewUrls,
    setAutoGenerationComplete
  };
};
