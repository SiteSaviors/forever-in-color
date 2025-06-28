
import { useState, useEffect } from "react";

interface UsePhotoUploadStateProps {
  selectedStyle: { id: number; name: string } | null;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
}

export const usePhotoUploadState = ({
  selectedStyle,
  onComplete
}: UsePhotoUploadStateProps) => {
  const [currentOrientation, setCurrentOrientation] = useState('square');
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const handleImageUpload = (imageUrl: string, originalImageUrl?: string, orientation?: string) => {
    console.log('🎨 Photo uploaded with unified canvas selection:', {
      imageUrl,
      orientation
    });

    // Store the original image for potential re-cropping
    setOriginalImage(originalImageUrl || imageUrl);
    setCroppedImage(imageUrl);
    setShowCropper(false);

    // If orientation was selected during cropping, update it
    if (orientation && orientation !== currentOrientation) {
      console.log('🎯 Canvas orientation selected during cropping:', orientation);
      setCurrentOrientation(orientation);
    }

    // Create a temporary style entry for state management
    if (selectedStyle) {
      onComplete(imageUrl, selectedStyle.id, selectedStyle.name);
    } else {
      // Create temporary style to maintain state flow
      onComplete(imageUrl, 0, "temp-style");
    }
  };

  const handleCropComplete = (croppedImageUrl: string, aspectRatio: number, orientation: string) => {
    console.log('🎨 Crop completed:', { croppedImageUrl, aspectRatio, orientation });
    
    setCroppedImage(croppedImageUrl);
    setCurrentOrientation(orientation);
    setShowCropper(false);

    // Update parent with new cropped image
    if (selectedStyle) {
      onComplete(croppedImageUrl, selectedStyle.id, selectedStyle.name);
    } else {
      onComplete(croppedImageUrl, 0, "temp-style");
    }
  };

  const handleRecropImage = () => {
    console.log('🎨 User wants to recrop image');
    setShowCropper(true);
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('🎨 Style selected:', {
      styleId,
      styleName
    });
    if (croppedImage) {
      onComplete(croppedImage, styleId, styleName);
    }
  };

  const hasValidImage = !!croppedImage;

  return {
    currentOrientation,
    showCropper,
    originalImage,
    croppedImage,
    hasValidImage,
    setCurrentOrientation,
    handleImageUpload,
    handleCropComplete,
    handleRecropImage,
    handleStyleSelect
  };
};
