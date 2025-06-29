
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculatePricing } from "@/components/product/utils/pricingUtils";

interface BottomMomentumPopupProps {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  selectedSize: string | null;
  selectedOrientation: string;
  customizations: Record<string, any>;
  selectedStyle: number | null;
  uploadedImage: string | null;
}

const BottomMomentumPopup = memo(({
  currentStep,
  selectedSize,
  selectedOrientation,
  customizations,
  selectedStyle,
  uploadedImage
}: BottomMomentumPopupProps) => {
  // Only show from step 2 onwards when user has uploaded image and selected style
  if (currentStep < 2 || !uploadedImage || !selectedStyle) {
    return null;
  }

  const pricing = calculatePricing(selectedSize, selectedOrientation, customizations);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <Card className="border-0 rounded-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {Math.floor(Math.random() * 20) + 5} people viewing this
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">
                  ${pricing.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Free shipping included</p>
              </div>
              
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8"
              >
                Continue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

BottomMomentumPopup.displayName = 'BottomMomentumPopup';

export default BottomMomentumPopup;
