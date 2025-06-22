
import { Palette, Image as ImageIcon, Settings, Gift } from "lucide-react";
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

interface StepConfig {
  id: string;
  number: number;
  title: string;
  icon: any;
  description: string;
  required: boolean;
  estimatedTime: string;
  isCompleted: boolean;
  content: React.ReactNode;
}

interface ProductStepsConfigProps {
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
  onEditStep: (stepNumber: number) => void;
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
  onEditStep
}: ProductStepsConfigProps): StepConfig[] => {
  return [
    {
      id: "upload-and-style",
      number: 1,
      title: "Upload Photo & Choose Style",
      icon: Palette,
      description: "Upload your photo and see it transformed in different artistic styles",
      required: true,
      estimatedTime: "3 min",
      isCompleted: completedSteps.includes(1),
      content: (
        <PhotoUploadAndStyleSelection
          onComplete={onPhotoAndStyleComplete}
          preSelectedStyle={selectedStyle}
        />
      )
    },
    {
      id: "customize",
      number: 2,
      title: "Choose Size & Layout",
      icon: ImageIcon,
      description: "Select your canvas orientation and size",
      required: true,
      estimatedTime: "2 min",
      isCompleted: completedSteps.includes(2),
      content: (
        <div className="space-y-4 md:space-y-8">
          <OrientationSelector
            selectedOrientation={selectedOrientation}
            selectedSize={selectedSize}
            onOrientationChange={onOrientationSelect}
            onSizeChange={onSizeSelect}
          />
        </div>
      )
    },
    {
      id: "customizations",
      number: 3,
      title: "Add Customizations & AR",
      icon: Settings,
      description: "Choose optional add-ons and personalization features",
      required: false,
      estimatedTime: "3 min",
      isCompleted: completedSteps.includes(3),
      content: (
        <CustomizationSelector
          selectedSize={selectedSize}
          customizations={customizations}
          onCustomizationChange={onCustomizationChange}
        />
      )
    },
    {
      id: "order",
      number: 4,
      title: "Review & Order",
      icon: Gift,
      description: "Review your order and complete your purchase",
      required: true,
      estimatedTime: "2 min",
      isCompleted: false,
      content: (
        <ReviewAndOrder
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
