
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, Sparkles, TrendingUp, Clock, Star, Zap, Target } from "lucide-react";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";
import { useStripePayment } from "../hooks/useStripePayment";

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
  const { state } = useProgressOrchestrator();
  const { processPayment, isProcessing } = useStripePayment();
  
  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  // Momentum level calculation
  const getMomentumLevel = () => {
    const score = state?.conversionElements?.momentumScore || 0;
    if (score >= 75) return { level: 'High', color: 'green', icon: Star };
    if (score >= 50) return { level: 'Medium', color: 'yellow', icon: TrendingUp };
    if (score >= 25) return { level: 'Building', color: 'blue', icon: Zap };
    return { level: 'Starting', color: 'gray', icon: Target };
  };

  // Pricing calculations
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
    if (customizations.floatingFrame.enabled) total += 29.99;
    if (customizations.livingMemory) total += 59.99;
    if (customizations.voiceMatch && customizations.livingMemory) total += 19.99;
    if (customizations.aiUpscale) total += 9.99;
    return total;
  };

  const basePrice = calculateBasePrice();
  const customizationPrice = calculateCustomizationPrice();
  const totalPrice = basePrice + customizationPrice;
  const savings = customizationPrice > 50 ? 25 : 0;

  const handleQuickPurchase = async () => {
    const items = [];
    
    const getSizePriceInCents = (size: string) => {
      const priceMap: Record<string, number> = {
        '16" x 16"': 9999, '24" x 24"': 14999, '32" x 32"': 19999, '36" x 36"': 26999,
        '16" x 12"': 9999, '24" x 18"': 14999, '36" x 24"': 19999, '40" x 30"': 26999,
        '48" x 32"': 34999, '60" x 40"': 49999, '12" x 16"': 9999, '18" x 24"': 14999,
        '24" x 36"': 19999, '30" x 40"': 26999, '32" x 48"': 34999, '40" x 60"': 49999,
      };
      return priceMap[size] || 9999;
    };

    const basePriceInCents = getSizePriceInCents(selectedSize);
    items.push({
      name: `${selectedStyle?.name || 'Custom'} Canvas`,
      description: `${selectedSize} canvas with ${selectedStyle?.name || 'custom'} style`,
      amount: basePriceInCents,
      quantity: 1
    });

    if (customizations.floatingFrame.enabled) {
      items.push({
        name: 'Floating Frame',
        description: `${customizations.floatingFrame.color} floating frame`,
        amount: 2999,
        quantity: 1
      });
    }

    if (customizations.livingMemory) {
      items.push({
        name: 'Living Memory AR',
        description: 'Augmented reality video activation',
        amount: 5999,
        quantity: 1
      });
    }

    if (customizations.voiceMatch && customizations.livingMemory) {
      items.push({
        name: 'Voice Match',
        description: 'Custom voice narration for AR experience',
        amount: 1999,
        quantity: 1
      });
    }

    if (customizations.aiUpscale) {
      items.push({
        name: 'AI Upscale',
        description: 'Enhanced image resolution',
        amount: 999,
        quantity: 1
      });
    }

    await processPayment(items);
  };

  const momentum = getMomentumLevel();
  const MomentumIcon = momentum.icon;

  // Don't show anything if no uploaded image in Step 1, or no size selected in Step 2+
  if (currentStep === 1 && !uploadedImage) return null;
  if (currentStep >= 2 && !selectedSize) return null;

  // Step 1: Show momentum tracker
  if (currentStep === 1) {
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
        <Card className="bg-white/95 backdrop-blur-md shadow-xl border border-purple-200 max-w-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                momentum.color === 'green' ? 'bg-green-500' :
                momentum.color === 'yellow' ? 'bg-yellow-500' :
                momentum.color === 'blue' ? 'bg-blue-500' :
                'bg-gray-500'
              } text-white`}>
                <MomentumIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Momentum</h4>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  momentum.color === 'green' ? 'bg-green-100 text-green-700' :
                  momentum.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  momentum.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {momentum.level}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{state?.conversionElements?.momentumScore || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    momentum.color === 'green' ? 'bg-green-500' :
                    momentum.color === 'yellow' ? 'bg-yellow-500' :
                    momentum.color === 'blue' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`}
                  style={{ width: `${state?.conversionElements?.momentumScore || 0}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{Math.floor((state?.conversionElements?.timeSpentOnPlatform || 0) / 60)}m active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2+: Show pricing calculator
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 md:p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <Card className="bg-white/95 backdrop-blur-sm border border-purple-200 shadow-xl">
          <CardContent className="p-3 md:p-4">
            {/* Progress Bar */}
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
                      <div className="text-green-600 font-medium">Save ${savings}!</div>
                    </>
                  )}
                </div>
              </div>
              
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
                  disabled={totalPrice === 0 || isProcessing}
                  onClick={handleQuickPurchase}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {isProcessing ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex md:items-center gap-3 md:gap-0 md:justify-between">
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
                    <div className="text-green-600 font-medium">Save ${savings}!</div>
                  )}
                </div>
              </div>
              
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
                  disabled={totalPrice === 0 || isProcessing}
                  onClick={handleQuickPurchase}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BottomMomentumPopup;
