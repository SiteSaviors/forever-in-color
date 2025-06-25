
import { useState, useCallback } from "react";
import { useStylePreview } from "../contexts/StylePreviewContext";

interface UseSimplifiedStyleCardProps {
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

export const useSimplifiedStyleCard = ({
  style,
  croppedImage,
  selectedStyle,
  shouldBlur = false,
  onStyleClick,
  onContinue
}: UseSimplifiedStyleCardProps) => {
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

  // Computed states
  const isSelected = selectedStyle === style.id;
  const isGenerating = isLoading(style.id);
  const hasGeneratedPreview = hasPreview(style.id);
  const previewUrl = getPreviewUrl(style.id);
  const error = getError(style.id);
  const showError = hasError(style.id);
  
  // Image display logic
  const imageToShow = previewUrl || croppedImage || style.image;
  const showContinueInCard = style.id === 1 || hasGeneratedPreview;
  const hasPreviewOrCropped = !!(previewUrl || croppedImage);
  const showGeneratedBadge = hasGeneratedPreview && style.id !== 1;
  const shouldShowBlur = shouldBlur && !hasGeneratedPreview && !isGenerating && !showError && style.id !== 1;

  // Main click handler - simplified logic
  const handleClick = useCallback(() => {
    console.log(`🎯 Style clicked: ${style.name} (ID: ${style.id})`);
    onStyleClick(style);
    
    // Auto-generate if needed - simple condition check
    const shouldAutoGenerate = croppedImage && 
      !hasGeneratedPreview && 
      !isGenerating && 
      !showError && 
      style.id !== 1;
      
    if (shouldAutoGenerate) {
      console.log(`🚀 Auto-generating preview for: ${style.name}`);
      generatePreview(style.id, style.name);
    }
  }, [style, croppedImage, hasGeneratedPreview, isGenerating, showError, onStyleClick, generatePreview]);

  // Generate preview handler
  const handleGenerateStyle = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    console.log(`🎨 Manual generate for: ${style.name}`);
    onStyleClick(style);
    await generatePreview(style.id, style.name);
  }, [style, onStyleClick, generatePreview]);

  // Retry handler
  const handleRetry = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    console.log(`🔄 Retry for: ${style.name}`);
    await retryGeneration(style.id, style.name);
  }, [style, retryGeneration]);

  // Continue handler
  const handleContinueClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContinue) {
      console.log(`Continue clicked for ${style.name}`);
      onContinue();
    }
  }, [style.name, onContinue]);

  // Expand handler
  const handleExpandClick = useCallback(() => {
    setIsExpanded(true);
  }, []);

  return {
    // States
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
    
    // Handlers
    handleClick,
    handleGenerateStyle,
    handleRetry,
    handleContinueClick,
    handleExpandClick
  };
};
