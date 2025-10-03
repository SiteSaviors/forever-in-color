import { useState, useEffect, useCallback } from "react";
import { convertOrientationToAspectRatio } from "../utils/orientationDetection";
import { generateAndWatermarkPreview } from "@/utils/previewGeneration";

export const usePreviewGeneration = (uploadedImage: string | null, selectedOrientation: string) => {
  const [previewUrls, setPreviewUrls] = useState<{ [key: number]: string }>({});
  const [autoGenerationComplete, setAutoGenerationComplete] = useState(false);
  const [generationErrors, setGenerationErrors] = useState<{ [key: number]: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset states when uploaded image changes but preserve previews within session
  useEffect(() => {
    if (!uploadedImage) {
      setAutoGenerationComplete(false);
      setPreviewUrls({});
      setGenerationErrors({});
    }
  }, [uploadedImage]);

  // Manual generation function that can be called for specific styles
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

      const aspectRatio = convertOrientationToAspectRatio(selectedOrientation);

      // Use shared generation function
      const { previewUrl: generatedUrl, isAuthenticated } = await generateAndWatermarkPreview(
        uploadedImage,
        styleName,
        styleId,
        aspectRatio,
        {
          watermark: false,
          persistToDb: isAuthenticated // Only persist if authenticated
        }
      );

      // Update state with successful result
      setPreviewUrls(prev => ({ ...prev, [styleId]: generatedUrl }));
      setGenerationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[styleId];
        return newErrors;
      });

      setIsGenerating(false);
      return generatedUrl;
    } catch (error) {
      // Store error for this specific style
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
