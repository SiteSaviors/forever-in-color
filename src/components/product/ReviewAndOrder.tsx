import { useState, useEffect } from "react";
import CanvasMockup from "./CanvasMockup";
import OrderSummary from "./OrderSummary";
import StickyOrderCTA from "./StickyOrderCTA";

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
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Calculate total for sticky CTA
  const getSizePrice = (size: string) => {
    switch (size) {
      case "8x10": return 49;
      case "12x16": return 89;  
      case "16x20": return 129;
      case "20x24": return 169;
      default: return 49;
    }
  };

  const basePrice = getSizePrice(selectedSize);
  const framePrice = customizations.floatingFrame.enabled ? 29 : 0;
  const livingMemoryPrice = customizations.livingMemory ? 19 : 0;
  const aiUpscalePrice = customizations.aiUpscale ? 9 : 0;
  const subtotal = basePrice + framePrice + livingMemoryPrice + aiUpscalePrice;
  const shipping = subtotal > 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  // Show sticky CTA when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      setShowStickyCTA(scrollPosition > windowHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePlaceOrder = () => {
    // Scroll to order summary or trigger order flow
    document.querySelector('[data-order-summary]')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  if (!uploadedImage || !selectedStyle || !selectedSize) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">Complete the previous steps to review your order</p>
        <p className="text-gray-400 text-sm">Upload a photo, choose your style, and select your size</p>
      </div>
    );
  }

  return (
    <>
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
          <div className="order-1 lg:order-2" data-order-summary>
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

      {/* Sticky Order CTA */}
      <StickyOrderCTA
        total={total}
        isVisible={showStickyCTA}
        onPlaceOrder={handlePlaceOrder}
      />
    </>
  );
};

export default ReviewAndOrder;
