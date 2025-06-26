
import CustomizationSelector from "../CustomizationSelector";

interface CustomizationStepProps {
  selectedSize: string;
  customizations: any;
  onCustomizationChange: (customizations: any) => void;
  selectedOrientation: string;
  selectedStyle?: { id: number; name: string } | null;
  previewUrls?: { [key: number]: string };
}

const CustomizationStep = ({
  selectedSize,
  customizations,
  onCustomizationChange,
  selectedOrientation,
  selectedStyle,
  previewUrls
}: CustomizationStepProps) => {
  return (
    <CustomizationSelector
      selectedSize={selectedSize}
      customizations={customizations}
      onCustomizationChange={onCustomizationChange}
      selectedOrientation={selectedOrientation}
      selectedStyle={selectedStyle}
      previewUrls={previewUrls}
    />
  );
};

export default CustomizationStep;
