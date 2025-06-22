
import CanvasMockup from "./CanvasMockup";
import OrderSummary from "./OrderSummary";

interface ReviewAndOrderProps {
  uploadedImage: string | null;
  selectedStyle: {id: number, name: string} | null;
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
  onEditStep?: (stepNumber: number) => void;
}

const ReviewAndOrder = ({ 
  uploadedImage, 
  selectedStyle, 
  selectedSize, 
  selectedOrientation, 
  customizations,
  onEditStep 
}: ReviewAndOrderProps) => {
  if (!uploadedImage || !selectedStyle || !selectedSize) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">Complete the previous steps to review your order</p>
        <p className="text-gray-400 text-sm">Upload a photo, choose your style, and select your size</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Review Your Canvas
        </h3>
        <p className="text-gray-600">
          Here's how your personalized canvas will look. Ready to make it yours?
        </p>
      </div>

      {/* Desktop Layout: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Canvas Mockup */}
        <div className="order-2 lg:order-1">
          <CanvasMockup
            imageUrl={uploadedImage}
            selectedSize={selectedSize}
            selectedOrientation={selectedOrientation}
            customizations={customizations}
          />
        </div>

        {/* Right: Order Summary */}
        <div className="order-1 lg:order-2">
          <OrderSummary
            uploadedImage={uploadedImage}
            selectedStyle={selectedStyle}
            selectedSize={selectedSize}
            selectedOrientation={selectedOrientation}
            customizations={customizations}
            onEditStep={onEditStep}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewAndOrder;
