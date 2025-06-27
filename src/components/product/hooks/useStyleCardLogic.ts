
import { useState, useCallback, useMemo } from "react";
import { useInteractionStateMachine } from "./useInteractionStateMachine";

interface UseStyleCardLogicProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  shouldBlur: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
  generatePreview: () => Promise<void>;
  getPreviewUrl: () => string | undefined;
  isLoading: boolean;
  hasPreview: boolean;
  hasError: boolean;
  getError: () => string | undefined;
}

export const useStyleCardLogic = ({
  style,
  croppedImage,
  selectedStyle,
  shouldBlur,
  onStyleClick,
  onContinue,
  generatePreview,
  getPreviewUrl,
  isLoading,
  hasPreview,
  hasError,
  getError
}: UseStyleCardLogicProps) => {
  const { state, transition } = useInteractionStateMachine('idle');
  
  // Derived states
  const isSelected = selectedStyle === style.id;
  const isGenerating = isLoading;
  const hasGeneratedPreview = hasPreview;
  const previewUrl = getPreviewUrl();
  const error = getError();
  const showError = hasError;

  // Image to show logic
  const imageToShow = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (croppedImage && isSelected) return croppedImage;
    return style.image;
  }, [previewUrl, croppedImage, isSelected, style.image]);

  // UI state calculations
  const showContinueInCard = isSelected && !!previewUrl;
  const hasPreviewOrCropped = !!previewUrl || (!!croppedImage && isSelected);
  const showGeneratedBadge = !!previewUrl;
  const shouldShowBlur = shouldBlur && !hasPreviewOrCropped && style.id !== 1;
  const isBlinking = isGenerating;

  // Handlers
  const handleClick = useCallback(() => {
    console.log(`🎯 Style clicked: ${style.name} (ID: ${style.id})`);
    onStyleClick(style);
    
    // If there's an error, clicking should retry
    if (hasError) {
      transition('RETRY');
      generatePreview().catch(err => {
        console.error('Generation failed:', err);
        transition('ERROR');
      });
    } else if (croppedImage && !hasPreview && !isLoading && style.id !== 1) {
      // Auto-generate preview for new selections
      transition('LOAD');
      generatePreview().then(() => {
        transition('SUCCESS');
      }).catch(err => {
        console.error('Generation failed:', err);
        transition('ERROR');
      });
    }
  }, [style, onStyleClick, hasError, croppedImage, hasPreview, isLoading, transition, generatePreview]);

  const handleGenerateStyle = useCallback(async () => {
    if (!croppedImage || style.id === 1) return;
    
    transition('LOAD');
    try {
      await generatePreview();
      transition('SUCCESS');
    } catch (err) {
      console.error('Generation failed:', err);
      transition('ERROR');
    }
  }, [croppedImage, style.id, transition, generatePreview]);

  const handleRetry = useCallback(() => {
    transition('RETRY');
    handleGenerateStyle();
  }, [transition, handleGenerateStyle]);

  const handleContinueClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (onContinue) {
      onContinue();
    }
  }, [onContinue]);

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
    isBlinking,
    handleClick,
    handleGenerateStyle,
    handleRetry,
    handleContinueClick
  };
};
