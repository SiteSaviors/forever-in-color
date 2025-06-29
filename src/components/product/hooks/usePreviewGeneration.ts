import { useState, useEffect, useCallback } from "react";
import { generateStylePreview } from "@/utils/stylePreviewApi";
import { addWatermarkToImage } from "@/utils/watermarkUtils";
import { convertOrientationToAspectRatio } from "../utils/orientationDetection";

export const usePreviewGeneration = (uploadedImage: string | null, selectedOrientation: string) => {
  const [previewUrls, setPreviewUrls] = useState<{ [key: number]: string }>({});
  const [autoGenerationComplete, setAutoGenerationComplete] = useState(false);
  const [generationErrors, setGenerationErrors] = useState<{ [key: number]: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);

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
        console.log('Skipping generation for Original Image style');
        setIsGenerating(false);
        return uploadedImage;
      }

      console.log(`Generating preview for ${styleName} with orientation ${selectedOrientation}`);
      
      // Use the correct aspect ratio format for the API
      const aspectRatio = convertOrientationToAspectRatio(selectedOrientation);
      
      const tempPhotoId = `temp_${Date.now()}_${styleId}`;
      
      try {
        const previewUrl = await generateStylePreview(
          uploadedImage, 
          styleName, 
          tempPhotoId, 
          aspectRatio
        );
        
        if (previewUrl) {
          try {
            // Apply client-side watermark
            const watermarkedUrl = await addWatermarkToImage(previewUrl);
            
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
          } catch (watermarkError) {
            console.warn(`Watermark failed for ${styleName}, using original:`, watermarkError);
            
            // Update with unwatermarked URL as fallback
            setPreviewUrls(prev => ({
              ...prev,
              [styleId]: previewUrl
            }));
            
            setIsGenerating(false);
            return previewUrl;
          }
        }
      } catch (error) {
        console.error(`❌ Error generating preview for ${styleName}:`, error);
        
        // Store the error message
        setGenerationErrors(prev => ({
          ...prev,
          [styleId]: error.message || 'Failed to generate preview'
        }));
        
        setIsGenerating(false);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error in generation process for ${styleName}:`, error);
      setGenerationErrors(prev => ({
        ...prev,
        [styleId]: error.message || 'Failed to generate preview'
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