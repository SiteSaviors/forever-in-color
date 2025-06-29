
import { useCallback } from "react";
import { getCroppedImg } from "@/utils/photoOperations";

export const useImageProcessing = () => {
  const processCroppedImage = useCallback(async (imageUrl: string, croppedAreaPixels: any, aspectRatio: number) => {
    if (!croppedAreaPixels) {
      throw new Error('No crop area specified');
    }

    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      return {
        croppedImageUrl: croppedImage,
        aspectRatio: aspectRatio
      };
    } catch (error) {
      console.error('Error processing cropped image:', error);
      throw error;
    }
  }, []);

  return {
    processCroppedImage
  };
};
