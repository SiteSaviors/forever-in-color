
import PhotoUpload from "@/components/product/PhotoUpload";
import StylePreview from "@/components/product/StylePreview";
import PricingSection from "@/components/product/PricingSection";
import { Upload, Gift } from "lucide-react";

interface StepContentProps {
  stepNumber: number;
  uploadedImage: string | null;
  onPhotoUpload: (imageUrl: string) => void;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onStepComplete: (stepNumber: number) => void;
}

const StepContent = ({ 
  stepNumber, 
  uploadedImage, 
  onPhotoUpload, 
  onStyleSelect, 
  onStepComplete 
}: StepContentProps) => {
  if (stepNumber === 1) {
    return <PhotoUpload onUploadComplete={onPhotoUpload} />;
  }

  if (stepNumber === 2) {
    if (!uploadedImage) {
      return (
        <div className="text-center py-12">
          <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Upload your photo first</p>
          <p className="text-gray-400 text-sm">Complete step 1 to see beautiful style previews</p>
        </div>
      );
    }
    return (
      <StylePreview 
        uploadedImage={uploadedImage}
        onStyleSelect={onStyleSelect}
        onComplete={() => onStepComplete(2)}
      />
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
      <div className="text-center py-12">
        <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">Almost there!</p>
        <p className="text-gray-400 text-sm">Order summary and checkout coming next...</p>
      </div>
    );
  }

  return null;
};

export default StepContent;
