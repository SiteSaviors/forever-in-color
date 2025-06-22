
import PhotoUpload from "@/components/product/PhotoUpload";
import StylePreview from "@/components/product/StylePreview";
import PricingSection from "@/components/product/PricingSection";
import ReviewAndOrder from "@/components/product/ReviewAndOrder";
import { Upload, Gift, Palette } from "lucide-react";

interface StepContentProps {
  stepNumber: number;
  uploadedImage: string | null;
  selectedStyle: { id: number; name: string } | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: {
    floatingFrame: {
      enabled: boolean;
      color: 'white' | 'black' | 'espresso';
    };
    livingMemory: boolean;
    voiceMatch: boolean;
    customMessage: string;
    aiUpscale: boolean;
  };
  onPhotoUpload: (imageUrl: string) => void;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onStepComplete: (stepNumber: number) => void;
  onEditStep: (stepNumber: number) => void;
}

const StepContent = ({ 
  stepNumber, 
  uploadedImage,
  selectedStyle,
  selectedSize,
  selectedOrientation,
  customizations,
  onPhotoUpload, 
  onStyleSelect, 
  onStepComplete,
  onEditStep
}: StepContentProps) => {
  if (stepNumber === 1) {
    return (
      <StylePreview 
        uploadedImage={null}
        onStyleSelect={onStyleSelect}
        onComplete={() => onStepComplete(1)}
      />
    );
  }

  if (stepNumber === 2) {
    if (!selectedStyle) {
      return (
        <div className="text-center py-12">
          <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Choose your style first</p>
          <p className="text-gray-400 text-sm">Complete step 1 to upload your photo for transformation</p>
        </div>
      );
    }
    return (
      <div className="text-center py-12">
        <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">Photo upload coming soon!</p>
        <p className="text-gray-400 text-sm">Upload functionality will be implemented next</p>
      </div>
    );
  }

  if (stepNumber === 3) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Customize Your Canvas</h3>
          <p className="text-gray-600">Choose your size, frame options, and more</p>
        </div>
        <PricingSection />
      </div>
    );
  }

  if (stepNumber === 4) {
    return (
      <ReviewAndOrder
        uploadedImage={uploadedImage}
        selectedStyle={selectedStyle}
        selectedSize={selectedSize}
        selectedOrientation={selectedOrientation}
        customizations={customizations}
      />
    );
  }

  return null;
};

export default StepContent;
