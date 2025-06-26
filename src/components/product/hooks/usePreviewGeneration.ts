
import { useState, useEffect } from "react";

export const usePreviewGeneration = (uploadedImage: string | null, selectedOrientation: string) => {
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [autoGenerationComplete, setAutoGenerationComplete] = useState(false);

  useEffect(() => {
    if (uploadedImage && selectedOrientation) {
      // Simple preview generation logic
      console.log('Generating previews for orientation:', selectedOrientation);
      setAutoGenerationComplete(true);
    }
  }, [uploadedImage, selectedOrientation]);

  return {
    previewUrls,
    autoGenerationComplete,
    setPreviewUrls,
    setAutoGenerationComplete
  };
};
