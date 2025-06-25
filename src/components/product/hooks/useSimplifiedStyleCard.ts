
import { useMemo } from 'react';
import { useStylePreview } from './useStylePreview';

interface UseSimplifiedStyleCardProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  shouldBlur: boolean;
  previewUrls: { [key: number]: string };
  autoGenerationComplete: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue: () => void;
}

export const useSimplifiedStyleCard = ({
  style,
  croppedImage,
  selectedStyle,
  shouldBlur,
  previewUrls,
  autoGenerationComplete,
  onStyleClick,
  onContinue
}: UseSimplifiedStyleCardProps) => {
  
  // Check if this style has a pre-generated preview
  const preGeneratedPreview = previewUrls[style.id];
  const isPopular = [2, 4, 5].includes(style.id);
  
  console.log(`🔍 useSimplifiedStyleCard for ${style.name}:`, {
    styleId: style.id,
    hasPreGeneratedPreview: !!preGeneratedPreview,
    preGeneratedUrl: preGeneratedPreview ? preGeneratedPreview.substring(0, 50) + '...' : null,
    isPopular,
    autoGenerationComplete
  });

  const {
    isLoading: isGenerating,
    previewUrl,
    hasGeneratedPreview,
    handleClick: handleStyleClick
  } = useStylePreview({
    style,
    croppedImage,
    isPopular,
    preGeneratedPreview, // Pass the auto-generated preview
    selectedOrientation: "square", // Default for now
    onStyleClick
  });

  // Determine which image to show
  const imageToShow = useMemo(() => {
    // If we have a preview (either pre-generated or newly generated), use it
    if (previewUrl) {
      console.log(`📸 ${style.name}: Using preview URL:`, previewUrl.substring(0, 50) + '...');
      return previewUrl;
    }
    
    // If we have a pre-generated preview but no previewUrl yet, use the pre-generated one
    if (preGeneratedPreview) {
      console.log(`📸 ${style.name}: Using pre-generated preview:`, preGeneratedPreview.substring(0, 50) + '...');
      return preGeneratedPreview;
    }
    
    // If we have cropped image and this is the Original style, use cropped image
    if (style.id === 1 && croppedImage) {
      console.log(`📸 ${style.name}: Using cropped image for Original style`);
      return croppedImage;
    }
    
    // Fall back to default style image
    console.log(`📸 ${style.name}: Using default style image`);
    return style.image;
  }, [previewUrl, preGeneratedPreview, croppedImage, style.id, style.image, style.name]);

  const isSelected = selectedStyle === style.id;
  const hasPreviewOrCropped = !!(previewUrl || preGeneratedPreview || (croppedImage && style.id === 1));
  const showGeneratedBadge = hasGeneratedPreview || !!preGeneratedPreview;
  const shouldShowBlur = shouldBlur && !isSelected;
  const showContinueInCard = isSelected && hasPreviewOrCropped;

  const handleClick = () => {
    console.log(`🎯 ${style.name}: Card clicked`);
    handleStyleClick();
  };

  const handleRetry = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    console.log(`🔄 ${style.name}: Retry clicked`);
    // The useStylePreview hook will handle retry logic
    handleStyleClick();
  };

  const handleContinueClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    console.log(`➡️ ${style.name}: Continue clicked`);
    onContinue();
  };

  const handleGenerateStyle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    console.log(`🎨 ${style.name}: Generate style clicked`);
    handleStyleClick();
  };

  return {
    isSelected,
    isGenerating,
    hasGeneratedPreview: hasGeneratedPreview || !!preGeneratedPreview,
    previewUrl: imageToShow, // Return the determined image
    error: null, // Simplified for now
    showError: false,
    imageToShow,
    showContinueInCard,
    hasPreviewOrCropped,
    showGeneratedBadge,
    shouldShowBlur,
    handleClick,
    handleRetry,
    handleContinueClick,
    handleGenerateStyle
  };
};
