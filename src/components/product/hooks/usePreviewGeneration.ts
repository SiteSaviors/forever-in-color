
import { useState, useEffect } from "react";
import { generateStylePreview } from "@/utils/stylePreviewApi";
import { addWatermarkToImage } from "@/utils/watermarkUtils";
import { convertOrientationToAspectRatio } from "../utils/orientationDetection";

export const usePreviewGeneration = (uploadedImage: string | null, selectedOrientation: string) => {
  const [previewUrls, setPreviewUrls] = useState<{ [key: number]: string }>({});
  const [autoGenerationComplete, setAutoGenerationComplete] = useState(false);

  // Remove the auto-generation useEffect entirely
  // Users will now need to manually click on styles to generate previews

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
