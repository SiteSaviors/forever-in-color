
import { Card, CardContent } from "@/components/ui/card";
import { useStripePayment } from "../hooks/useStripePayment";
import { usePricingCalculator } from "./bottom-momentum/PricingCalculator";
import { buildPaymentItems } from "./bottom-momentum/PaymentItemsBuilder";
import ProgressSection from "./bottom-momentum/ProgressSection";
import MobileLayout from "./bottom-momentum/MobileLayout";
import DesktopLayout from "./bottom-momentum/DesktopLayout";

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

  // Don't show anything if no uploaded image in Step 1, or no size selected in Step 2+
  if (currentStep === 1 && !uploadedImage) return null;
  if (currentStep >= 2 && !selectedSize) return null;

  // Step 1: Don't show momentum tracker anymore (handled by unified widget)
  if (currentStep === 1) {
    return null;
  }

  // Step 2+: Show pricing calculator
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 md:p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <Card className="bg-white/95 backdrop-blur-sm border border-purple-200 shadow-xl">
          <CardContent className="p-3 md:p-4">
            <ProgressSection completedSteps={completedSteps} totalSteps={totalSteps} />

            <MobileLayout
              selectedSize={selectedSize}
              basePrice={basePrice}
              customizationPrice={customizationPrice}
              totalPrice={totalPrice}
              savings={savings}
              isProcessing={isProcessing}
              onQuickPurchase={handleQuickPurchase}
            />

            <DesktopLayout
              selectedSize={selectedSize}
              basePrice={basePrice}
              customizationPrice={customizationPrice}
              totalPrice={totalPrice}
              savings={savings}
              isProcessing={isProcessing}
              onQuickPurchase={handleQuickPurchase}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BottomMomentumPopup;
