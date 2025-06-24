
import { ReactNode } from "react";
import PhotoUploadAndStyleSelection from "./PhotoUploadAndStyleSelection";
import OrientationSelector from "./OrientationSelector";
import SizeSelector from "./SizeSelector";
import CustomizationSelector from "./CustomizationSelector";
import OrderSummary from "./OrderSummary";

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
  isCompleted: boolean;
  content: ReactNode;
}

interface UseProductStepsConfigProps {
  completedSteps: number[];
  selectedStyle: {id: number, name: string} | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
  uploadedImage: string | null;
  previewUrls: { [key: number]: string };
  autoGenerationComplete: boolean;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onOrientationSelect: (orientation: string) => void;
  onSizeSelect: (size: string) => void;
  onCustomizationChange: (customizations: CustomizationOptions) => void;
  onEditStep: (stepNumber: number) => void;
  onContinue: () => void;
}

export const useProductStepsConfig = ({
  completedSteps,
  selectedStyle,
  selectedSize,
  selectedOrientation,
  customizations,
  uploadedImage,
  previewUrls,
  autoGenerationComplete,
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
      description: "Upload your image and select an artistic style",
      isCompleted: completedSteps.includes(1),
      content: (
        <PhotoUploadAndStyleSelection
          selectedStyle={selectedStyle}
          uploadedImage={uploadedImage}
          previewUrls={previewUrls}
          autoGenerationComplete={autoGenerationComplete}
          onPhotoAndStyleComplete={onPhotoAndStyleComplete}
          onContinue={onContinue}
        />
      )
    },
    {
      id: "step-2",
      number: 2,
      title: "Choose Canvas Size",
      description: "Select your preferred canvas dimensions",
      isCompleted: completedSteps.includes(2),
      content: (
        <div className="space-y-6">
          <OrientationSelector
            selectedOrientation={selectedOrientation}
            onOrientationSelect={onOrientationSelect}
          />
          <SizeSelector
            selectedSize={selectedSize}
            selectedOrientation={selectedOrientation}
            onSizeSelect={onSizeSelect}
          />
        </div>
      )
    },
    {
      id: "step-3",
      number: 3,
      title: "Customize Your Order",
      description: "Add premium features and customizations",
      isCompleted: completedSteps.includes(3),
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
      description: "Review your selections and complete your order",
      isCompleted: completedSteps.includes(4),
      content: (
        <OrderSummary
          uploadedImage={uploadedImage}
          selectedStyle={selectedStyle}
          selectedSize={selectedSize}
          selectedOrientation={selectedOrientation}
          customizations={customizations}
          onEditStep={onEditStep}
        />
      )
    }
  ];
};
