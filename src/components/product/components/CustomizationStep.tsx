
import CustomizationSelector from "../CustomizationSelector";
import ProductStepWrapper from "./ProductStepWrapper";
import { CustomizationOptions } from "../types/productState";

interface CustomizationStepProps {
  currentStep: number;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  selectedSize: string;
  customizations: CustomizationOptions;
  onCustomizationChange: (customizations: CustomizationOptions) => void;
  selectedOrientation: string;
  selectedStyle?: { id: number; name: string } | null;
  previewUrls?: { [key: number]: string };
  userArtworkUrl?: string | null;
  isGeneratingPreviews?: boolean;
  previewError?: string | null;
  onStepClick: () => void;
}

const CustomizationStep = ({
  currentStep,
  isActive,
  isCompleted,
  canAccess,
  selectedSize,
  customizations,
  onCustomizationChange,
  selectedOrientation,
  selectedStyle,
  previewUrls,
  userArtworkUrl,
  isGeneratingPreviews,
  previewError,
  onStepClick
}: CustomizationStepProps) => {
  return (
    <ProductStepWrapper
      stepNumber={3}
      title="Customize Your Canvas"
      description="Add premium features and customizations"
      isActive={isActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={onStepClick}
    >
      {currentStep === 3 && (
        <CustomizationSelector
          selectedSize={selectedSize}
          customizations={customizations}
          onCustomizationChange={onCustomizationChange}
          selectedOrientation={selectedOrientation}
          selectedStyle={selectedStyle}
          previewUrls={previewUrls}
          userArtworkUrl={userArtworkUrl}
          isGeneratingPreviews={isGeneratingPreviews}
          previewError={previewError}
        />
      )}
    </ProductStepWrapper>
  );
};

export default CustomizationStep;
