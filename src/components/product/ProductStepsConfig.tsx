import { ReactNode } from "react";
import PhotoUploadAndStyleSelection from "./PhotoUploadAndStyleSelection";
import OrientationSelector from "./OrientationSelector";
import CustomizationSelector from "./CustomizationSelector";
import ReviewAndOrder from "./ReviewAndOrder";

interface CustomizationOptions {
  floatingFrame: {
    enabled: boolean;
    color: 'white' | 'black' | 'espresso';
  };
  livingMemory: boolean;
  voiceMatch: boolean;
  customMessage: string;
  aiUpscale: boolean;
}

interface ProductStep {
  id: string;
  number: number;
  title: string;
  description: string;
  content: ReactNode;
  isCompleted: boolean;
  isEnabled: boolean;
}

interface UseProductStepsConfigProps {
  completedSteps: number[];
  selectedStyle: {id: number, name: string} | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
  uploadedImage: string | null;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onOrientationSelect: (orientation: string) => void;
  onSizeSelect: (size: string) => void;
  onCustomizationChange: (customizations: CustomizationOptions) => void;
  onEditStep: (step: number) => void;
  onContinue?: () => void;
}

export const useProductStepsConfig = ({
  completedSteps,
  selectedStyle,
  selectedSize,
  selectedOrientation,
  customizations,
  uploadedImage,
  onPhotoAndStyleComplete,
  onOrientationSelect,
  onSizeSelect,
  onCustomizationChange,
  onEditStep,
  onContinue
}: UseProductStepsConfigProps): ProductStep[] => {
  return [
    {
      id: "step-1",
      number: 1,
      title: "Upload Photo & Choose Style",
      description: "Upload your photo and select an artistic style",
      isCompleted: completedSteps.includes(1),
      isEnabled: true,
      content: (
        <PhotoUploadAndStyleSelection
          onComplete={onPhotoAndStyleComplete}
          preSelectedStyle={selectedStyle}
        />
      )
    },
    {
      id: "step-2",
      number: 2,
      title: "Choose Size & Orientation",
      description: "Select the perfect size and orientation for your canvas",
      isCompleted: completedSteps.includes(2),
      isEnabled: completedSteps.includes(1),
      content: (
        <OrientationSelector
          selectedOrientation={selectedOrientation}
          selectedSize={selectedSize}
          onOrientationChange={onOrientationSelect}
          onSizeChange={onSizeSelect}
          onContinue={onContinue}
        />
      )
    },
    {
      id: "step-3",
      number: 3,
      title: "Customize Your Order",
      description: "Add premium features and personalization options",
      isCompleted: completedSteps.includes(3),
      isEnabled: completedSteps.includes(2),
      content: (
        <CustomizationSelector
          customizations={customizations}
          onCustomizationChange={onCustomizationChange}
        />
      )
    },
    {
      id: "step-4",
      number: 4,
      title: "Review & Order",
      description: "Review your custom canvas and complete your order",
      isCompleted: completedSteps.includes(4),
      isEnabled: completedSteps.includes(3),
      content: (
        <ReviewAndOrder
          selectedStyle={selectedStyle}
          selectedSize={selectedSize}
          selectedOrientation={selectedOrientation}
          customizations={customizations}
          uploadedImage={uploadedImage}
        />
      )
    }
  ];
};
