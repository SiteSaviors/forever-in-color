
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { CustomizationOptions } from "../types/productState";

interface BottomMomentumPopupProps {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
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

  // Show popup when user reaches step 2 or beyond
  useEffect(() => {
    if (currentStep >= 2 && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Show after 3 seconds on step 2+

      return () => clearTimeout(timer);
    }
  }, [currentStep, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleContinue = () => {
    // Navigate to next step or checkout
    if (currentStep < totalSteps) {
      const nextStepElement = document.querySelector(`[data-step="${currentStep + 1}"]`);
      if (nextStepElement) {
        nextStepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    setIsVisible(false);
  };

  if (!isVisible || isDismissed || currentStep < 2) {
    return null;
  }

  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Great Progress!</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}% Complete</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <Separator className="bg-white/20" />

              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <div className="font-medium">Almost there!</div>
                  <div className="opacity-90">Continue to complete your order</div>
                </div>
                <Button
                  onClick={handleContinue}
                  className="bg-white text-purple-600 hover:bg-gray-100 font-medium"
                  size="sm"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default BottomMomentumPopup;
