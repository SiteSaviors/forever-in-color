
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Clock, Users, Sparkles } from "lucide-react";

interface BottomMomentumPopupProps {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  selectedSize: string;
  selectedOrientation: string;
  customizations: {
    floatingFrame: { enabled: boolean; color: string };
    livingMemory: boolean;
    voiceMatch: boolean;
    customMessage: string;
    aiUpscale: boolean;
  };
  selectedStyle: { id: number; name: string } | null;
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
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentUsers] = useState(Math.floor(Math.random() * 15) + 8);

  useEffect(() => {
    if (isDismissed || !uploadedImage || !selectedStyle) return;

    const shouldShow = currentStep >= 2 && completedSteps.length >= 2;
    
    if (shouldShow) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, completedSteps.length, isDismissed, uploadedImage, selectedStyle]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const calculateProgress = () => {
    return (completedSteps.length / totalSteps) * 100;
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <Card className="bg-white/95 backdrop-blur-xl border-2 border-purple-200 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Users className="w-3 h-3 mr-1" />
                    {currentUsers} creating now
                  </Badge>
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.round(calculateProgress())}% Complete
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Your Canvas is Almost Ready!
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Style: {selectedStyle?.name}</span>
                    <Badge variant="outline" className="text-xs">Selected</Badge>
                  </div>
                  
                  {selectedSize && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Size: {selectedSize}</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedOrientation.charAt(0).toUpperCase() + selectedOrientation.slice(1)}
                      </Badge>
                    </div>
                  )}
                  
                  {customizations.floatingFrame.enabled && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Floating Frame</span>
                      <Badge className="bg-amber-100 text-amber-700 text-xs">Premium</Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={() => {
                    const orderSection = document.querySelector('[data-step="4"]');
                    if (orderSection) {
                      orderSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Complete Order
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  Free shipping on orders over $75
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BottomMomentumPopup;
