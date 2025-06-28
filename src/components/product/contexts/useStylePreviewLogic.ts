
import { useCallback } from 'react';
import { ArtStyle } from '@/types/artStyle';
import { convertOrientationToAspectRatio } from '../utils/orientationDetection';
import { generateStylePreview } from '@/utils/stylePreviewApi';

interface UseStylePreviewLogicProps {
  croppedImage: string | null;
  selectedOrientation: string;
}

export const useStylePreviewLogic = ({ croppedImage, selectedOrientation }: UseStylePreviewLogicProps) => {
  
  const generatePreview = useCallback(async (style: ArtStyle) => {
    if (!croppedImage || style.id === 1) {
      return null;
    }

    try {
      const aspectRatio = convertOrientationToAspectRatio(selectedOrientation);
      const tempPhotoId = `temp_${Date.now()}_${style.id}`;
      
      const previewUrl = await generateStylePreview(
        croppedImage,
        style.name,
        tempPhotoId,
        aspectRatio
      );
      
      return previewUrl;
    } catch (error) {
      console.error(`Error generating preview for ${style.name}:`, error);
      return null;
    }
  }, [croppedImage, selectedOrientation]);

  const canGeneratePreview = useCallback((style: ArtStyle) => {
    return !!(croppedImage && style.id !== 1);
  }, [croppedImage]);

  return {
    generatePreview,
    canGeneratePreview
  };
};
