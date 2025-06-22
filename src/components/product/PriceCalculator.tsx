
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
}

const PriceCalculator = ({ selectedSize, selectedOrientation, customizations }: PriceCalculatorProps) => {
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <Card className="bg-white/95 backdrop-blur-sm border border-purple-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-600">Your Canvas</span>
                  {selectedSize && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {selectedSize}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {basePrice > 0 && (
                    <div className="text-sm text-gray-500">
                      Base: <span className="font-semibold">${basePrice.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {customizationPrice > 0 && (
                    <div className="text-sm text-gray-500">
                      Add-ons: <span className="font-semibold text-purple-600">+${customizationPrice.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {savings > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      Save ${savings}!
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-2xl font-bold text-gray-900 font-poppins tracking-tight">
                    ${totalPrice > 0 ? (totalPrice - savings).toFixed(2) : '0.00'}
                  </div>
                </div>
                
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  size="lg"
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
