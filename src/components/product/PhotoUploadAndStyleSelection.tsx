
import { useState, useCallback, useEffect } from 'react';
import { StylePreviewProvider } from './contexts/StylePreviewContext';
import PhotoUploadFlow from './components/PhotoUploadFlow';

interface PhotoUploadAndStyleSelectionProps {
  selectedStyle: { id: number; name: string } | null;
  uploadedImage: string | null;
  selectedOrientation: string;
  autoGenerationComplete: boolean;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue: () => void;
  currentStep: number;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

const PhotoUploadAndStyleSelection = ({
  selectedStyle,
  uploadedImage,
  selectedOrientation,
  autoGenerationComplete,
  onComplete,
  onPhotoAndStyleComplete,
  onContinue,
  currentStep,
  completedSteps,
  onStepChange
}: PhotoUploadAndStyleSelectionProps) => {
  const [croppedImage, setCroppedImage] = useState<string | null>(uploadedImage);

  // Debug logs to track orientation flow
  useEffect(() => {
    console.log('🔥 CRITICAL: PhotoUploadAndStyleSelection received selectedOrientation:', selectedOrientation);
  }, [selectedOrientation]);

  const handleComplete = useCallback((imageUrl: string, styleId: number, styleName: string) => {
    console.log('🔥 CRITICAL: PhotoUploadAndStyleSelection handleComplete called with orientation:', selectedOrientation);
    setCroppedImage(imageUrl);
    onComplete(imageUrl, styleId, styleName);
  }, [onComplete, selectedOrientation]);

  return (
    <StylePreviewProvider 
      croppedImage={croppedImage} 
      selectedOrientation={selectedOrientation}
    >
      <PhotoUploadFlow
        selectedStyle={selectedStyle}
        uploadedImage={uploadedImage}
        selectedOrientation={selectedOrientation}
        autoGenerationComplete={autoGenerationComplete}
        onComplete={handleComplete}
        onPhotoAndStyleComplete={onPhotoAndStyleComplete}
        onContinue={onContinue}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepChange={onStepChange}
      />
    </StylePreviewProvider>
  );
};

export default PhotoUploadAndStyleSelection;
