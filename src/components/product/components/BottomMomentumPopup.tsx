
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStripePayment } from "@/hooks/useStripePayment";
import { usePricingCalculator } from "./bottom-momentum/PricingCalculator";
import { buildPaymentItems } from "./bottom-momentum/PaymentItemsBuilder";
import { CheckCircle, Crown, Sparkles, TrendingUp, Users } from "lucide-react";

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

  const progress = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <div className="bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Horizontal Layout */}
            <div className="flex items-center justify-between gap-8">
              
              {/* Left: Progress & Product Info */}
              <div className="flex items-center gap-8">
                {/* Compact Progress */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalSteps }, (_, i) => {
                      const stepNumber = i + 1;
                      const isCompleted = completedSteps.includes(stepNumber);
                      
                      return (
                        <div key={stepNumber} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-purple-600 scale-110' : 'bg-gray-200'
                          }`} />
                          {i < totalSteps - 1 && (
                            <div className={`w-6 h-0.5 transition-all duration-300 ${
                              isCompleted ? 'bg-purple-600' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold text-xs px-2 py-1">
                    {progress}% Complete
                  </Badge>
                </div>

                {/* Product Info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                      Premium Canvas Print
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">
                      {selectedSize || "Custom Size"} • Museum Quality
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Pricing & CTA */}
              <div className="flex items-center gap-6">
                {/* Live Activity Badge */}
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-3 py-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  <Users className="w-3 h-3 mr-1" />
                  234 active now
                </Badge>

                {/* Savings Badge */}
                {savings > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 px-3 py-1.5 text-sm font-bold">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Save ${savings}
                  </Badge>
                )}

                {/* Price */}
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">${totalPrice}</span>
                    {savings > 0 && (
                      <span className="text-sm text-gray-400 line-through">${totalPrice + savings}</span>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleQuickPurchase}
                  disabled={isProcessing}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[160px]"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Complete Order
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomMomentumPopup;
