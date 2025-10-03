import { useState, useEffect, useCallback } from "react";
import { generateStylePreview, fetchPreviewStatus } from "@/utils/stylePreviewApi";
import { createPreview } from "@/utils/previewOperations";
import { addWatermarkToImage } from "@/utils/watermarkUtils";
import { convertOrientationToAspectRatio } from "../utils/orientationDetection";

export const usePreviewGeneration = (uploadedImage: string | null, selectedOrientation: string) => {
  const [previewUrls, setPreviewUrls] = useState<{ [key: number]: string }>({});
  const [autoGenerationComplete, setAutoGenerationComplete] = useState(false);
  const [generationErrors, setGenerationErrors] = useState<{ [key: number]: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const pollPreviewStatusUntilReady = useCallback(async (requestId: string) => {
    const maxAttempts = 30;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const status = await fetchPreviewStatus(requestId);
      const normalizedStatus = status.status?.toLowerCase();

      if ((normalizedStatus === 'succeeded' || normalizedStatus === 'complete') && status.preview_url) {
        return status.preview_url as string;
      }

      if (normalizedStatus === 'failed' || normalizedStatus === 'error') {
        throw new Error(status.error || 'Preview generation failed');
      }

      attempt += 1;
      const backoff = Math.min(4000, 500 + attempt * 250);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }

    throw new Error('Preview generation timed out. Please try again.');
  }, []);

  // Remove the auto-generation useEffect entirely
  // Users will now need to manually click on styles to generate previews

  // Reset states when uploaded image changes but preserve previews within session
  useEffect(() => {
    if (!uploadedImage) {
      setAutoGenerationComplete(false);
      setPreviewUrls({});
      setGenerationErrors({});
    }
  }, [uploadedImage]);

  // Add a manual generation function that can be called for specific styles
  const generatePreviewForStyle = useCallback(async (styleId: number, styleName: string) => {
    if (!uploadedImage) {
      console.error('Cannot generate preview: no image uploaded');
      return null;
    }

    setIsGenerating(true);

    try {
      // Skip generation for Original Image style
      if (styleId === 1) {
        setIsGenerating(false);
        return uploadedImage;
      }
      
      // Use the correct aspect ratio format for the API
      const aspectRatio = convertOrientationToAspectRatio(selectedOrientation);
      
      const tempPhotoId = `temp_${Date.now()}_${styleId}`;
      
      try {
        const result = await generateStylePreview(
          uploadedImage, 
          styleName, 
          tempPhotoId, 
          aspectRatio
        );
        
        let resolvedPreviewUrl: string | null = null;

        if (result.status === 'complete') {
          resolvedPreviewUrl = result.previewUrl;
        } else if (result.status === 'processing') {
          const finalPreviewUrl = await pollPreviewStatusUntilReady(result.requestId);
          resolvedPreviewUrl = finalPreviewUrl;

          if (result.isAuthenticated) {
            try {
              await createPreview(tempPhotoId, styleName, finalPreviewUrl);
            } catch (persistError) {
              console.warn('Failed to persist preview metadata', persistError);
            }
          }
        }

        if (resolvedPreviewUrl) {
          try {
            // Apply client-side watermark
            const watermarkedUrl = await addWatermarkToImage(resolvedPreviewUrl);
            
            // Update the preview URLs state
            setPreviewUrls(prev => ({
              ...prev,
              [styleId]: watermarkedUrl
            }));
            
            // Clear any previous errors for this style
            setGenerationErrors(prev => {
              const newErrors = {...prev};
              delete newErrors[styleId];
              return newErrors;
            });
            
            setIsGenerating(false);
            return watermarkedUrl;
          } catch (_watermarkError) {
            // Watermark failed, use original

            // Update with unwatermarked URL as fallback
            setPreviewUrls(prev => ({
              ...prev,
              [styleId]: resolvedPreviewUrl
            }));
            
            setIsGenerating(false);
            return resolvedPreviewUrl;
          }
        }
      } catch (_error) {
        // Error generating preview

        // Store the error message
        setGenerationErrors(prev => ({
          ...prev,
          [styleId]: _error.message || 'Failed to generate preview'
        }));

        setIsGenerating(false);
        return null;
      }
    } catch (_error) {
      // Error in generation process
      setGenerationErrors(prev => ({
        ...prev,
        [styleId]: _error.message || 'Failed to generate preview'
      }));
      setIsGenerating(false);
      return null;
    }
  }, [uploadedImage, selectedOrientation]);

  return {
    previewUrls,
    autoGenerationComplete,
    generationErrors,
    isGenerating,
    setPreviewUrls,
    setAutoGenerationComplete,
    generatePreviewForStyle
  };
};
