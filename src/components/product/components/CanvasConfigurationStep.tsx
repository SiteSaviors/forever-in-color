
import { memo } from "react";
import SizeSelectionSection from "../orientation/components/SizeSelectionSection";

interface CanvasConfigurationStepProps {
  selectedSize: string | null;
  selectedOrientation: string;
  uploadedImage: string | null;
  onSizeSelect: (size: string) => void;
  onOrientationSelect: (orientation: string) => void;
}

const CanvasConfigurationStep = memo(({
  selectedSize,
  selectedOrientation,
  uploadedImage,
  onSizeSelect,
  onOrientationSelect
}: CanvasConfigurationStepProps) => {
  return (
    <div className="space-y-8">
      <SizeSelectionSection
        selectedSize={selectedSize}
        selectedOrientation={selectedOrientation}
        uploadedImage={uploadedImage}
        onSizeSelect={onSizeSelect}
        onOrientationSelect={onOrientationSelect}
      />
    </div>
  );
});

CanvasConfigurationStep.displayName = 'CanvasConfigurationStep';

export default CanvasConfigurationStep;
