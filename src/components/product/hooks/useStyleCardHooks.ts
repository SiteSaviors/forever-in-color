
import { useState, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useStylePreview } from './useStylePreview';

interface UseStyleCardHooksProps {
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
  cropAspectRatio?: number;
  selectedOrientation?: string;
  showContinueButton?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue: () => void;
}

export const useStyleCardHooks = (props: UseStyleCardHooksProps) => {
  const {
    style,
    croppedImage,
    selectedStyle,
    preGeneratedPreview,
    cropAspectRatio,
    selectedOrientation = "square",
    showContinueButton = true,
    onStyleClick,
    onContinue
  } = props;

  const { toast } = useToast();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Style preview hook
  const {
    previewUrl,
    isLoading: isStyleLoading,
    hasError,
    errorMessage,
    isGenerated: isPermanentlyGenerated,
    generatePreview,
    retryGeneration
  } = useStylePreview({
    styleId: style.id,
    croppedImage,
    preGeneratedPreview,
    cropAspectRatio,
    selectedOrientation
  });

  // Computed state
  const isSelected = selectedStyle === style.id;
  const hasErrorBoolean = hasError;
  const effectiveIsLoading = isStyleLoading;
  const hasGeneratedPreview = !!previewUrl;
  const showGeneratedBadge = hasGeneratedPreview && !isStyleLoading;
  const imageToShow = previewUrl || style.image;
  const showContinueInCard = isSelected && showContinueButton && hasGeneratedPreview;
  const showLockedFeedback = !croppedImage;

  // Handlers
  const handleCardClick = useCallback(() => {
    if (!croppedImage) {
      toast({
        title: "Upload a photo first",
        description: "Please upload your photo before selecting a style",
        variant: "destructive"
      });
      return;
    }

    onStyleClick(style);
  }, [croppedImage, onStyleClick, style, toast]);

  const handleContinueClick = useCallback(() => {
    onContinue();
  }, [onContinue]);

  const handleGenerateWrapper = useCallback(() => {
    if (!croppedImage) {
      toast({
        title: "Upload required",
        description: "Please upload your photo first",
        variant: "destructive"
      });
      return;
    }
    generatePreview();
  }, [croppedImage, generatePreview, toast]);

  const handleRetryWrapper = useCallback(() => {
    retryGeneration();
  }, [retryGeneration]);

  // Touch handlers
  const touchHandlers = useMemo(() => ({
    onTouchStart: () => setIsPressed(true),
    onTouchEnd: () => setIsPressed(false),
    onTouchCancel: () => setIsPressed(false)
  }), []);

  return {
    // State
    isSelected,
    hasErrorBoolean,
    errorMessage,
    effectiveIsLoading,
    isPermanentlyGenerated,
    isLightboxOpen,
    setIsLightboxOpen,
    hasGeneratedPreview,
    showGeneratedBadge,
    imageToShow,
    showContinueInCard,
    showLockedFeedback,
    
    // Handlers
    handleCardClick,
    handleContinueClick,
    handleGenerateWrapper,
    handleRetryWrapper,
    
    // Interactions
    isPressed,
    touchHandlers
  };
};
