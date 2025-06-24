
import { Button } from "@/components/ui/button";
import { useStripePayment } from "../hooks/useStripePayment";

interface OrderActionsProps {
  total: number;
  selectedSize: string;
  selectedStyle: {id: number, name: string} | null;
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
}

const OrderActions = ({ 
  total, 
  selectedSize, 
  selectedStyle, 
  customizations 
}: OrderActionsProps) => {
  const { processPayment, isProcessing } = useStripePayment();

  const handleCompleteOrder = async () => {
    // Create payment items based on the order
    const items = [];
    
    // Base canvas item
    const getSizePrice = (size: string) => {
      switch (size) {
        case "8x10": return 4900; // $49.00 in cents
        case "12x16": return 8900; // $89.00 in cents
        case "16x20": return 12900; // $129.00 in cents
        case "20x24": return 16900; // $169.00 in cents
        default: return 4900;
      }
    };

    const basePrice = getSizePrice(selectedSize);
    items.push({
      name: `${selectedStyle?.name || 'Custom'} Canvas`,
      description: `${selectedSize} canvas with ${selectedStyle?.name || 'custom'} style`,
      amount: basePrice,
      quantity: 1
    });

    // Add customizations
    if (customizations.floatingFrame.enabled) {
      items.push({
        name: 'Floating Frame',
        description: `${customizations.floatingFrame.color} floating frame`,
        amount: 2900, // $29.00 in cents
        quantity: 1
      });
    }

    if (customizations.livingMemory) {
      items.push({
        name: 'Living Memory AR',
        description: 'Augmented reality video activation',
        amount: 5999, // $59.99 in cents
        quantity: 1
      });
    }

    if (customizations.voiceMatch && customizations.livingMemory) {
      items.push({
        name: 'Voice Match',
        description: 'Custom voice narration for AR experience',
        amount: 1999, // $19.99 in cents
        quantity: 1
      });
    }

    if (customizations.aiUpscale) {
      items.push({
        name: 'AI Upscale',
        description: 'Enhanced image resolution',
        amount: 900, // $9.00 in cents
        quantity: 1
      });
    }

    await processPayment(items);
  };

  return (
    <div className="space-y-3">
      <Button 
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
        size="lg"
        onClick={handleCompleteOrder}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : `Complete Order • $${total.toFixed(2)}`}
      </Button>
      <p className="text-xs text-center text-gray-500">
        Secure checkout powered by Stripe • 30-day money-back guarantee
      </p>
    </div>
  );
};

export default OrderActions;
