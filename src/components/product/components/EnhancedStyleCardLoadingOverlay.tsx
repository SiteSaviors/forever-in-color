
import { useState, useEffect, memo } from "react";
import { Loader2, Sparkles, Palette, Wand2 } from "lucide-react";

interface EnhancedStyleCardLoadingOverlayProps {
  isVisible: boolean;
  styleName: string;
}

const generationSteps = [
  { icon: Sparkles, text: "Analyzing your photo..." },
  { icon: Palette, text: "Applying artistic style..." },
  { icon: Wand2, text: "Adding finishing touches..." },
];

const EnhancedStyleCardLoadingOverlay = memo(({
  isVisible,
  styleName
}: EnhancedStyleCardLoadingOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % generationSteps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const currentStepData = generationSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
      <div className="text-center text-white space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-400" />
          <div className="absolute inset-0 flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">Creating {styleName}</h4>
          <p className="text-sm opacity-90">{currentStepData.text}</p>
        </div>
        
        <div className="flex justify-center space-x-1">
          {generationSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentStep ? 'bg-purple-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

EnhancedStyleCardLoadingOverlay.displayName = 'EnhancedStyleCardLoadingOverlay';

export default EnhancedStyleCardLoadingOverlay;
