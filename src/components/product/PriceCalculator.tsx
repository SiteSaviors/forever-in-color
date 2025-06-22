import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, Sparkles } from "lucide-react";

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

interface PriceCalculatorProps {
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
  completedSteps: number[];
  totalSteps: number;
}

const PriceCalculator = ({ selectedSize, selectedOrientation, customizations, completedSteps, totalSteps }: PriceCalculatorProps) => {
  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  const calculateBasePrice = () => {
    if (!selectedSize || !selectedOrientation) return 0;

    const sizeOptions: Record<string, Record<string, number>> = {
      horizontal: {
        '16" x 12"': 99.99,
        '24" x 18"': 149.99,
        '36" x 24"': 199.99,
        '40" x 30"': 269.99,
        '48" x 32"': 349.99,
        '60" x 40"': 499.99,
      },
      vertical: {
        '12" x 16"': 99.99,
        '18" x 24"': 149.99,
        '24" x 36"': 199.99,
        '30" x 40"': 269.99,
        '32" x 48"': 349.99,
        '40" x 60"': 499.99,
      },
      square: {
        '16" x 16"': 99.99,
        '24" x 24"': 149.99,
        '32" x 32"': 199.99,
        '36" x 36"': 269.99,
      }
    };

    return sizeOptions[selectedOrientation]?.[selectedSize] || 0;
  };

  const calculateCustomizationPrice = () => {
    let total = 0;
    
    if (customizations.floatingFrame.enabled) {
      total += 29.99; // Floating frame price
    }
    
    if (customizations.livingMemory) {
      total += 59.99; // Living Memory AR price
    }
    
    if (customizations.voiceMatch) {
      total += 19.99; // Voice Match price
    }
    
    if (customizations.aiUpscale) {
      total += 9.99; // AI Upscale price
    }
    
    return total;
  };

  const basePrice = calculateBasePrice();
  const customizationPrice = calculateCustomizationPrice();
  const totalPrice = basePrice + customizationPrice;
  const savings = customizationPrice > 50 ? 25 : 0; // Example savings logic

  // Only show if user has selected a size
  if (!selectedSize) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 md:p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <Card className="bg-white/95 backdrop-blur-sm border border-purple-200 shadow-xl">
          <CardContent className="p-3 md:p-4">
            {/* Progress Bar - Always at the top */}
            <div className="mb-3 md:mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600">Your Progress</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-purple-600">{Math.round(progressPercentage)}%</span>
                  <span className="text-xs text-gray-500 hidden md:inline">Complete</span>
                </div>
              </div>
              <div className="relative">
                <Progress value={progressPercentage} className="h-2 bg-gray-200" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" 
                     style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex md:hidden items-center justify-between">
              {/* Left Side - Canvas Info */}
              <div className="flex-1 min-w-0 mr-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-600">Your Canvas</span>
                  {selectedSize && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {selectedSize}
                    </span>
                  )}
                </div>
                
                {/* Price Breakdown - Compact horizontal layout */}
                <div className="flex items-center gap-2 text-xs">
                  {basePrice > 0 && (
                    <div className="text-gray-500">
                      Base: <span className="font-semibold">${basePrice.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {customizationPrice > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="text-gray-500">
                        Add-ons: <span className="font-semibold text-purple-600">+${customizationPrice.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  
                  {savings > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="text-green-600 font-medium">
                        Save ${savings}!
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Right Side - Total Price and CTA */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-lg font-bold text-gray-900 font-poppins tracking-tight">
                    ${totalPrice > 0 ? (totalPrice - savings).toFixed(2) : '0.00'}
                  </div>
                </div>
                
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm px-3 py-2 whitespace-nowrap"
                  size="default"
                  disabled={totalPrice === 0}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Desktop Layout - Keep existing structure */}
            <div className="hidden md:flex md:items-center gap-3 md:gap-0 md:justify-between">
              {/* Product Info Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-600">Your Canvas</span>
                  {selectedSize && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full whitespace-nowrap">
                      {selectedSize}
                    </span>
                  )}
                </div>
                
                {/* Price Breakdown - Stack on mobile, inline on desktop */}
                <div className="flex items-center gap-4 text-sm">
                  {basePrice > 0 && (
                    <div className="text-gray-500">
                      Base: <span className="font-semibold">${basePrice.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {customizationPrice > 0 && (
                    <div className="text-gray-500">
                      Add-ons: <span className="font-semibold text-purple-600">+${customizationPrice.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {savings > 0 && (
                    <div className="text-green-600 font-medium">
                      Save ${savings}!
                    </div>
                  )}
                </div>
              </div>
              
              {/* Price and CTA Section */}
              <div className="flex items-center justify-end gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-2xl font-bold text-gray-900 font-poppins tracking-tight">
                    ${totalPrice > 0 ? (totalPrice - savings).toFixed(2) : '0.00'}
                  </div>
                </div>
                
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-base px-4 py-2 whitespace-nowrap"
                  size="default"
                  disabled={totalPrice === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PriceCalculator;
