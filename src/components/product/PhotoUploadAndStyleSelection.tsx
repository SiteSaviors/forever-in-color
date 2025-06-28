
import PhotoUploadFlow from "./components/PhotoUploadFlow";
import { AspectRatioErrorBoundary } from "./orientation/components/AspectRatioErrorBoundary";

interface PhotoUploadAndStyleSelectionProps {
  selectedStyle: {
    id: number;
    name: string;
  } | null;
  uploadedImage: string | null;
  selectedOrientation: string;
  autoGenerationComplete: boolean;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue: () => void;
  currentStep: number;
  completedSteps: number[];
  onStepChange: (step: number) => void;
  onFileInputTriggerReady?: (triggerFn: () => boolean) => void;
}

const PhotoUploadAndStyleSelection = (props: PhotoUploadAndStyleSelectionProps) => {
  const handleRetry = () => {
    // Reset any error states and allow user to retry
    window.location.reload();
  };

  return (
    <AspectRatioErrorBoundary 
      onRetry={handleRetry}
      fallbackOrientation="square"
    >
      <PhotoUploadFlow {...props} />
    </AspectRatioErrorBoundary>
  );
};

export default PhotoUploadAndStyleSelection;
