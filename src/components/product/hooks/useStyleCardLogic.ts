
import { useState, useCallback } from "react";
import { useStylePreview } from "../contexts/StylePreviewContext";

interface UseStyleCardLogicProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  shouldBlur?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

export const useStyleCardLogic = ({
  style,
  croppedImage,
  selectedStyle,
  shouldBlur = false,
  onStyleClick,
  onContinue
}: UseStyleCardLogicProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { 
    generatePreview, 
    retryGeneration,
    isLoading, 
    hasPreview, 
    hasError,
    getPreviewUrl,
    getError
  } = useStylePreview();

  const isSelected = selectedStyle === style.id;
  const isGenerating = isLoading(style.id);
  const hasGeneratedPreview = hasPreview(style.id);
  const previewUrl = getPreviewUrl(style.id);
  const error = getError(style.id);
  const showError = hasError(style.id);
  
  // Determine what image to show
  const imageToShow = previewUrl || croppedImage || style.image;
  
  // Show continue button logic - show for Original Image OR when style has generated preview
  const showContinueInCard = style.id === 1 || hasGeneratedPreview;
  const hasPreviewOrCropped = !!(previewUrl || croppedImage);
  
  // Show generated badge for styles that have previews (but not Original Image)
  const showGeneratedBadge = hasGeneratedPreview && style.id !== 1;

  // CRITICAL FIX: Determine blur state properly
  const shouldShowBlur = shouldBlur && !hasGeneratedPreview && !isGenerating && !showError && style.id !== 1;

  // Enhanced aspect ratio calculation
  const getCropAspectRatio = useCallback((selectedOrientation: string) => {
    switch (selectedOrientation) {
      case 'vertical':
        return 3/4;
      case 'horizontal':
        return 4/3;
      case 'square':
      default:
        return 1;
    }
  }, []);

  // MAIN CARD CLICK HANDLER
  const handleClick = useCallback(() => {
    console.log(`🎯 MAIN CARD CLICK ▶️ ${style.name} (ID: ${style.id}), shouldBlur: ${shouldBlur}, isGenerating: ${isGenerating}`);
    onStyleClick(style);
    
    // Auto-generate if conditions are met (and not already generating or in error state)
    if (croppedImage && !hasGeneratedPreview && !isGenerating && !showError && style.id !== 1) {
      console.log(`🚀 Auto-generating preview for clicked style: ${style.name}`);
      generatePreview(style.id, style.name);
    }
  }, [style, croppedImage, hasGeneratedPreview, isGenerating, showError, shouldBlur, onStyleClick, generatePreview]);

  // Handle manual generation button click (for blurred cards)
  const handleGenerateStyle = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log(`🎨 MANUAL GENERATE CLICKED ▶️ ${style.name} (ID: ${style.id})`);
    
    onStyleClick(style);
    await generatePreview(style.id, style.name);
  }, [style, onStyleClick, generatePreview]);

  // Handle retry button click
  const handleRetry = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log(`🔄 RETRY CLICKED ▶️ ${style.name} (ID: ${style.id})`);
    await retryGeneration(style.id, style.name);
  }, [style, retryGeneration]);

  // Handle preview expansion
  const handleExpandClick = useCallback(() => {
    setIsExpanded(true);
  }, []);

  // Handle continue click - UPDATED TO GO TO STEP 2
  const handleContinueClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContinue) {
      console.log(`Continue clicked for ${style.name} - going to Step 2`);
      onContinue();
    }
  }, [style.name, onContinue]);

  return {
    isSelected,
    isGenerating,
    hasGeneratedPreview,
    previewUrl,
    error,
    showError,
    imageToShow,
    showContinueInCard,
    hasPreviewOrCropped,
    showGeneratedBadge,
    shouldShowBlur,
    isExpanded,
    setIsExpanded,
    getCropAspectRatio,
    handleClick,
    handleGenerateStyle,
    handleRetry,
    handleExpandClick,
    handleContinueClick
  };
};
