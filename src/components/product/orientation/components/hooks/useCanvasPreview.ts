
import { useState, useCallback } from "react";

interface UseCanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
  variant: 'interactive' | 'morphing' | 'simple';
}

export const useCanvasPreview = ({ orientation, userImageUrl, variant }: UseCanvasPreviewProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [morphing, setMorphing] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const getCanvasFrame = useCallback(() => {
    switch (orientation) {
      case 'horizontal':
        return '/lovable-uploads/5e67d281-e2f5-4b6b-942d-32f66511851e.png';
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
      default:
        return '/lovable-uploads/1308e62b-7d30-4d01-bad3-ef128e25924b.png';
    }
  }, [orientation]);

  const getImagePosition = useCallback(() => {
    switch (orientation) {
      case 'horizontal':
        return {
          top: '6%',
          left: '6%',
          width: '88%',
          height: '88%'
        };
      case 'vertical':
        return {
          top: '8%',
          left: '8%',
          width: '84%',
          height: '84%'
        };
      case 'square':
      default:
        return {
          top: '8%',
          left: '8%',
          width: '84%',
          height: '84%'
        };
    }
  }, [orientation]);

  const getAspectRatio = useCallback(() => {
    switch (orientation) {
      case 'horizontal':
        return 3/2;
      case 'vertical':
        return 2/3;
      case 'square':
      default:
        return 1;
    }
  }, [orientation]);

  return {
    imageLoaded,
    morphing,
    canvasFrame: getCanvasFrame(),
    imagePosition: getImagePosition(),
    handleImageLoad,
    getAspectRatio,
    setMorphing
  };
};
