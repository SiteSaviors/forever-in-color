
import { useState, useEffect } from 'react';
import { useStylePreview } from './useStylePreview';

interface UseStyleCardLogicProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  isPopular?: boolean;
  preGeneratedPreview?: string;
  selectedOrientation?: string;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
}

export const useStyleCardLogic = ({
  style,
  croppedImage,
  selectedStyle,
  isPopular = false,
  preGeneratedPreview,
  selectedOrientation = "square",
  onStyleClick
}: UseStyleCardLogicProps) => {
  const [showError, setShowError] = useState(false);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPermanentlyGenerated, setIsPermanentlyGenerated] = useState(false);

  const {
    isLoading,
    previewUrl,
    hasGeneratedPreview,
    isStyleGenerated,
    validationError,
    handleClick,
    generatePreview
  } = useStylePreview({
    style,
    croppedImage,
    isPopular,
    preGeneratedPreview,
    selectedOrientation,
    onStyleClick
  });

  const isSelected = selectedStyle === style.id;
  const showGeneratedBadge = hasGeneratedPreview && isStyleGenerated;
  const hasError = showError || validationError;
  const imageToShow = previewUrl || croppedImage || style.image;
  
  // CRITICAL: Once permanently generated, NEVER allow any loading states
  const effectiveIsLoading = isPermanentlyGenerated ? false : (isLoading || localIsLoading);

  // CRITICAL: Reset all loading states immediately when permanently generated
  useEffect(() => {
    if (isPermanentlyGenerated) {
      console.log(`🛑 StyleCard: ${style.name} is permanently generated, forcing all loading states to false`);
      setLocalIsLoading(false);
      setShowError(false);
    }
  }, [isPermanentlyGenerated, style.name]);

  return {
    // State
    showError,
    setShowError,
    localIsLoading,
    setLocalIsLoading,
    isLightboxOpen,
    setIsLightboxOpen,
    isPermanentlyGenerated,
    setIsPermanentlyGenerated,
    
    // Preview hook values
    isLoading,
    previewUrl,
    hasGeneratedPreview,
    isStyleGenerated,
    validationError,
    handleClick,
    generatePreview,
    
    // Computed values
    isSelected,
    showGeneratedBadge,
    hasError,
    imageToShow,
    effectiveIsLoading
  };
};
