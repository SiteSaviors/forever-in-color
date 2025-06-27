
import { Card, CardContent } from "@/components/ui/card";
import { useStripePayment } from "../hooks/useStripePayment";
import { usePricingCalculator } from "./bottom-momentum/PricingCalculator";
import { buildPaymentItems } from "./bottom-momentum/PaymentItemsBuilder";
import ProgressSection from "./bottom-momentum/ProgressSection";
import PremiumHorizontalLayout from "./bottom-momentum/PremiumHorizontalLayout";

interface CustomizationOptions {
  floatingFrame: {
    enabled: boolean;
    color: 'white' | 'black' | 'espresso';
  };
  livingMemory: boolean;
  voiceMatch: boolean;
  customMessage: string;
  aiUpscale: boolean;
}

interface BottomMomentumPopupProps {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
  selectedStyle?: {id: number, name: string} | null;
  uploadedImage: string | null;
}

const BottomMomentumPopup = ({
  currentStep,
  completedSteps,
  totalSteps,
  selectedSize,
  selectedOrientation,
  customizations,
  selectedStyle,
  uploadedImage
}: BottomMomentumPopupProps) => {
  const { processPayment, isProcessing } = useStripePayment();
  
  const { basePrice, customizationPrice, totalPrice, savings } = usePricingCalculator({
    selectedSize,
    selectedOrientation,
    customizations
  });

  const handleQuickPurchase = async () => {
    const items = buildPaymentItems({
      selectedSize,
      selectedStyle,
      customizations
    });

    await processPayment(items);
  };

  // Only show if we have an uploaded image and are past step 1
  if (!uploadedImage || currentStep < 2) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 pb-4 pointer-events-auto">
        <Card className="bg-white/98 backdrop-blur-xl border-0 shadow-2xl shadow-black/20">
          <CardContent className="p-0">
            <div className="px-6 py-4">
              <ProgressSection completedSteps={completedSteps} totalSteps={totalSteps} />
              
              <PremiumHorizontalLayout
                selectedSize={selectedSize}
                basePrice={basePrice}
                customizationPrice={customizationPrice}
                totalPrice={totalPrice}
                savings={savings}
                isProcessing={isProcessing}
                onQuickPurchase={handleQuickPurchase}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BottomMomentumPopup;
