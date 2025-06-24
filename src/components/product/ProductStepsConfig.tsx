
import { ReactNode } from "react";
import { LucideIcon, Upload, Palette, Settings, ShoppingCart } from "lucide-react";
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
  icon: LucideIcon;
  description: string;
  required: boolean;
  estimatedTime: string;
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
      icon: Upload,
      description: "Upload your image and select an artistic style",
      required: true,
      estimatedTime: "2-3 min",
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
      icon: Palette,
      description: "Select your preferred canvas dimensions",
      required: true,
      estimatedTime: "1-2 min",
      isCompleted: completedSteps.includes(2),
      content: (
        <div className="space-y-6">
          <OrientationSelector
            selectedOrientation={selectedOrientation}
            selectedSize={selectedSize}
            onOrientationChange={onOrientationSelect}
            onSizeChange={onSizeSelect}
            onContinue={onContinue}
          />
        </div>
      )
    },
    {
      id: "step-3",
      number: 3,
      title: "Customize Your Order",
      icon: Settings,
      description: "Add premium features and customizations",
      required: false,
      estimatedTime: "1-2 min",
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
      id: "step-4",
      number: 4,
      title: "Review & Order",
      icon: ShoppingCart,
      description: "Review your selections and complete your order",
      required: true,
      estimatedTime: "2-3 min",
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
