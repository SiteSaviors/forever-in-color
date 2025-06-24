
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import PaymentForm from "./PaymentForm";
import TrustBadges from "./TrustBadges";
import DeliveryEstimator from "./DeliveryEstimator";
import GiftNotes from "./GiftNotes";
import OrderTestimonials from "./OrderTestimonials";
import OrderSummaryHeader from "./order/OrderSummaryHeader";
import OrderItemsList from "./order/OrderItemsList";
import PricingBreakdown from "./order/PricingBreakdown";
import CustomerInformation from "./order/CustomerInformation";
import OrderActions from "./order/OrderActions";

interface OrderSummaryProps {
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

const OrderSummary = ({ 
  uploadedImage, 
  selectedStyle, 
  selectedSize, 
  selectedOrientation, 
  customizations,
  onEditStep 
}: OrderSummaryProps) => {
  const [giftMessage, setGiftMessage] = useState('');
  
  // Calculate pricing
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

  const handleEditStep = (stepNumber: number) => {
    if (onEditStep) {
      onEditStep(stepNumber);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary Card */}
      <Card>
        <OrderSummaryHeader />
        <CardContent className="space-y-4">
          <OrderItemsList
            uploadedImage={uploadedImage}
            selectedStyle={selectedStyle}
            selectedSize={selectedSize}
            selectedOrientation={selectedOrientation}
            customizations={customizations}
            basePrice={basePrice}
            onEditStep={handleEditStep}
          />
          <PricingBreakdown
            subtotal={subtotal}
            shipping={shipping}
            total={total}
          />
        </CardContent>
      </Card>

      {/* Delivery Estimator */}
      <DeliveryEstimator />

      {/* Customer Information */}
      <CustomerInformation />

      {/* Gift Notes */}
      <GiftNotes 
        giftMessage={giftMessage}
        onGiftMessageChange={setGiftMessage}
      />

      {/* Payment Form */}
      <PaymentForm />

      {/* Order Testimonials */}
      <OrderTestimonials />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Order Actions */}
      <OrderActions total={total} />
    </div>
  );
};

export default OrderSummary;
