
import { useState, useEffect } from "react";

interface UsePhotoUploadStateProps {
  selectedStyle: { id: number; name: string } | null;
  uploadedImage: string | null;
  selectedOrientation: string;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
}

export const usePhotoUploadState = ({
  selectedStyle,
  uploadedImage,
  selectedOrientation,
  onPhotoAndStyleComplete
}: UsePhotoUploadStateProps) => {
  const [currentOrientation, setCurrentOrientation] = useState(selectedOrientation);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(uploadedImage);

  // Update local orientation state when prop changes
  useEffect(() => {
    setCurrentOrientation(selectedOrientation);
  }, [selectedOrientation]);

  // Update cropped image when uploadedImage prop changes
  useEffect(() => {
    setCroppedImage(uploadedImage);
  }, [uploadedImage]);

  const handleImageUpload = (imageUrl: string, originalImageUrl?: string, orientation?: string) => {

    // Store the original image for potential re-cropping
    setOriginalImage(originalImageUrl || imageUrl);
    setCroppedImage(imageUrl);
    setShowCropper(false);

    // If orientation was selected during cropping, update it
    if (orientation && orientation !== currentOrientation) {
      setCurrentOrientation(orientation);
    }

    // Create a temporary style entry for state management
    if (selectedStyle) {
      onPhotoAndStyleComplete(imageUrl, selectedStyle.id, selectedStyle.name);
    } else {
      // Create temporary style to maintain state flow
      onPhotoAndStyleComplete(imageUrl, 0, "temp-style");
    }
  };

  const handleCropComplete = (croppedImageUrl: string, aspectRatio: number, orientation: string) => {
    
    setCroppedImage(croppedImageUrl);
    setCurrentOrientation(orientation);
    setShowCropper(false);

    // Update parent with new cropped image
    if (selectedStyle) {
      onPhotoAndStyleComplete(croppedImageUrl, selectedStyle.id, selectedStyle.name);
    } else {
      onPhotoAndStyleComplete(croppedImageUrl, 0, "temp-style");
    }
  };

  const handleRecropImage = () => {
    setShowCropper(true);
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    if (croppedImage) {
      onPhotoAndStyleComplete(croppedImage, styleId, styleName);
    }
  };

  return {
    currentOrientation,
    showCropper,
    originalImage,
    croppedImage,
    setCurrentOrientation,
    handleImageUpload,
    handleCropComplete,
    handleRecropImage,
    handleStyleSelect
  };
};
