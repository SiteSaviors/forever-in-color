
import { ProgressOrchestrator } from "./progress/ProgressOrchestrator";
import PhotoUploadFlow from "./components/PhotoUploadFlow";

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
}

const PhotoUploadAndStyleSelection = (props: PhotoUploadAndStyleSelectionProps) => {
  return (
    <ProgressOrchestrator>
      <PhotoUploadFlow {...props} />
    </ProgressOrchestrator>
  );
};

export default PhotoUploadAndStyleSelection;
