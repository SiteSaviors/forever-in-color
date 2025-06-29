
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomizationConfig {
  floatingFrame: {
    enabled: boolean;
    color: 'white' | 'black' | 'espresso';
  };
  livingMemory: boolean;
  voiceMatch: boolean;
  customMessage: string;
  aiUpscale: boolean;
}

interface PricingSummaryProps {
  selectedSize: string;
  customizations: CustomizationConfig;
}

const PricingSummary = ({ selectedSize, customizations }: PricingSummaryProps) => {
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
  const livingMemoryPrice = customizations.livingMemory ? 59.99 : 0;
  const voiceMatchPrice = customizations.voiceMatch ? 19.99 : 0;
  const aiUpscalePrice = customizations.aiUpscale ? 9 : 0;
  
  const subtotal = basePrice + framePrice + livingMemoryPrice + voiceMatchPrice + aiUpscalePrice;
  const shipping = subtotal > 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span>{selectedSize} Canvas</span>
          <span>${basePrice}</span>
        </div>
        {customizations.floatingFrame.enabled && (
          <div className="flex justify-between">
            <span>Floating Frame ({customizations.floatingFrame.color})</span>
            <span>${framePrice}</span>
          </div>
        )}
        {customizations.livingMemory && (
          <div className="flex justify-between">
            <span>Living Memory</span>
            <span>${livingMemoryPrice}</span>
          </div>
        )}
        {customizations.voiceMatch && (
          <div className="flex justify-between">
            <span>Voice Match</span>
            <span>${voiceMatchPrice}</span>
          </div>
        )}
        {customizations.aiUpscale && (
          <div className="flex justify-between">
            <span>AI Upscale</span>
            <span>${aiUpscalePrice}</span>
          </div>
        )}
        <hr />
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
        </div>
        <hr />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingSummary;
