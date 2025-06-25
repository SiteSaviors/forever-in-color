
import { useState, useEffect } from "react";
import { generateStylePreview } from "@/utils/stylePreviewApi";
import { addWatermarkToImage } from "@/utils/watermarkUtils";
import { convertOrientationToAspectRatio } from "../utils/orientationDetection";

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
        console.log('Auto-generating previews for popular styles:', popularStyleIds);
        console.log('Current selected orientation:', selectedOrientation);
        
        const aspectRatio = convertOrientationToAspectRatio(selectedOrientation);
        console.log(`Using aspect ratio ${aspectRatio} for auto-generation based on orientation ${selectedOrientation}`);
        
        for (const styleId of popularStyleIds) {
          const style = artStyles.find(s => s.id === styleId);
          if (!style) continue;

          try {
            console.log(`Auto-generating preview for ${style.name} (ID: ${styleId}) with aspect ratio: ${aspectRatio}`);
            
            const tempPhotoId = `temp_${Date.now()}_${styleId}`;
            const previewUrl = await generateStylePreview(uploadedImage, style.name, tempPhotoId, aspectRatio);

            if (previewUrl) {
              try {
                const watermarkedUrl = await addWatermarkToImage(previewUrl);
                setPreviewUrls(prev => ({ ...prev, [styleId]: watermarkedUrl }));
                console.log(`Auto-generated preview for ${style.name} completed with watermark and aspect ratio ${aspectRatio}`);
              } catch (watermarkError) {
                console.warn(`Failed to add watermark for ${style.name}, using original:`, watermarkError);
                setPreviewUrls(prev => ({ ...prev, [styleId]: previewUrl }));
              }
            }
          } catch (error) {
            console.error(`Error auto-generating preview for ${style.name}:`, error);
          }
        }
        
        setAutoGenerationComplete(true);
        console.log('Auto-generation of popular style previews completed');
      };

      generatePopularPreviews();
    }
  }, [uploadedImage, autoGenerationComplete, selectedOrientation]);

  // Reset states when uploaded image changes but preserve previews within session
  useEffect(() => {
    if (!uploadedImage) {
      setAutoGenerationComplete(false);
      setPreviewUrls({});
    }
  }, [uploadedImage]);

  return {
    previewUrls,
    autoGenerationComplete,
    setPreviewUrls,
    setAutoGenerationComplete
  };
};
