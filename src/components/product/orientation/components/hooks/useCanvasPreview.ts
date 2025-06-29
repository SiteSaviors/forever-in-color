
import { useState, useEffect, useCallback, useMemo } from "react";

interface UseCanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
  variant: 'interactive' | 'morphing' | 'simple';
}

export const useCanvasPreview = ({
  orientation,
  userImageUrl,
  variant
}: UseCanvasPreviewProps) => {
  const [morphing, setMorphing] = useState(false);
  const [prevOrientation, setPrevOrientation] = useState(orientation);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Handle morphing animation for morphing variant
  useEffect(() => {
    if (variant === 'morphing' && prevOrientation !== orientation) {
      setMorphing(true);
      setImageLoaded(false);
      setTimeout(() => {
        setPrevOrientation(orientation);
        setMorphing(false);
        setImageLoaded(true);
      }, 300);
    } else if (userImageUrl) {
      setImageLoaded(true);
    }
  }, [orientation, prevOrientation, userImageUrl, variant]);

  const canvasFrame = useMemo(() => {
    switch (orientation) {
      case 'horizontal':
        return '/lovable-uploads/5e67d281-e2f5-4b6b-942d-32f66511851e.png'; // New horizontal canvas
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
      default:
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
    }
  }, [orientation]);

  const imagePosition = useMemo(() => {
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
          top: '15%',
          left: '20%',
          width: '60%',
          height: '70%'
        };
      case 'square':
        return {
          top: '5.2%',
          left: '4.7%',
          width: '89.3%',
          height: '89.3%'
        };
      default:
        return {
          top: '5.2%',
          left: '4.7%',
          width: '89.3%',
          height: '89.3%'
        };
    }
  }, [orientation]);

  const getAspectRatio = useCallback(() => {
    switch (orientation) {
      case 'horizontal':
        return 4 / 3;
      case 'vertical':
        return 3 / 4;
      case 'square':
        return 1;
      default:
        return 1;
    }
  }, [orientation]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return {
    morphing,
    imageLoaded,
    canvasFrame,
    imagePosition,
    getAspectRatio,
    handleImageLoad
  };
};
