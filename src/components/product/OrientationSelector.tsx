import OrientationCard from "./orientation/components/OrientationCard";
import GlassMorphismSizeCard from "./orientation/components/GlassMorphismSizeCard";
import OrientationHeader from "./orientation/components/OrientationHeader";
import SizeHeader from "./orientation/components/SizeHeader";
import SmartRecommendations from "./orientation/components/SmartRecommendations";
import StepNavigation from "./components/StepNavigation";
import { useBackNavigation } from "./hooks/useBackNavigation";
import { orientationOptions } from "./orientation/data/orientationOptions";
import { sizeOptions } from "./orientation/data/sizeOptions";
import { OrientationSelectorProps } from "./orientation/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, ArrowDown, DollarSign } from "lucide-react";
import { useState } from "react";

interface ExtendedOrientationSelectorProps extends OrientationSelectorProps {
  userImageUrl?: string | null;
  currentStep?: number;
  completedSteps?: number[];
  onStepChange?: (step: number) => void;
}

const OrientationSelector = ({
  selectedOrientation,
  selectedSize,
  userImageUrl = null,
  onOrientationChange,
  onSizeChange,
  onContinue,
  currentStep = 2,
  completedSteps = [],
  onStepChange = () => {}
}: ExtendedOrientationSelectorProps) => {
  
  const { canGoBack, handleBackStep } = useBackNavigation({
    currentStep,
    completedSteps,
    onStepChange
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleOrientationSelect = (orientation: string) => {
    setValidationError(null);
    onOrientationChange(orientation);
    // Reset size when orientation changes
    onSizeChange("");
  };
  
  const handleSizeSelect = (size: string) => {
    setValidationError(null);
    onSizeChange(size);
  };
  
  const handleContinueWithSize = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSizeChange(size);
    handleContinueClick();
  };

  const handleContinueClick = () => {
    if (!selectedOrientation) {
      setValidationError("Please select an orientation before continuing");
      // Scroll to orientation section
      document.querySelector('[data-orientation-section]')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      return;
    }
    
    if (!selectedSize) {
      setValidationError("Please select a size before continuing");
      // Scroll to size section
      document.querySelector('[data-size-section]')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      return;
    }
    
    setValidationError(null);
    if (onContinue) {
      onContinue();
    }
  };

  // Smart recommendation logic - for demo, recommend square as most versatile
  const getRecommendedOrientation = () => {
    if (!userImageUrl) return 'square';
    // This would analyze the image aspect ratio in a real implementation
    return 'square';
  };

  // Smart size recommendation based on orientation
  const getRecommendedSize = (orientation: string) => {
    const recommendations = {
      'square': '16" x 16"',
      'horizontal': '18" x 24"',
      'vertical': '16" x 20"'
    };
    return recommendations[orientation as keyof typeof recommendations] || '';
  };
  
  const recommendedOrientation = getRecommendedOrientation();
  const recommendedSize = getRecommendedSize(selectedOrientation);

  const canContinueToNext = Boolean(selectedOrientation && selectedSize);

  return (
    <div className="space-y-10">
      <OrientationHeader selectedOrientation={selectedOrientation} />

      {/* Validation Error Alert */}
      {validationError && (
        <Alert className="border-red-200 bg-red-50 animate-in fade-in duration-300">
          <AlertDescription className="text-red-800 font-medium">
            {validationError}
          </AlertDescription>
        </Alert>
      )}

      {/* Visual Connection Helper */}
      {userImageUrl && (
        <Alert className="border-blue-200 bg-blue-50">
          <Eye className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>✨ Live Preview:</strong> The canvases below show exactly how your photo will look in each orientation. This is your actual image positioned on the final product!
          </AlertDescription>
        </Alert>
      )}

      {/* Smart Recommendations Panel */}
      {userImageUrl && (
        <div className="relative">
          <SmartRecommendations selectedOrientation={selectedOrientation} userImageUrl={userImageUrl} />
        </div>
      )}

      {/* Premium Orientation Cards */}
      <div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        data-orientation-section
        role="radiogroup"
        aria-label="Canvas orientation options"
      >
        {orientationOptions.map(orientation => (
          <div 
            key={orientation.id} 
            className="transform transition-all duration-500 hover:-translate-y-2"
          >
            <OrientationCard 
              orientation={orientation} 
              isSelected={selectedOrientation === orientation.id} 
              isRecommended={orientation.id === getRecommendedOrientation()}
              userImageUrl={userImageUrl} 
              onClick={() => handleOrientationSelect(orientation.id)} 
            />
          </div>
        ))}
      </div>

      {/* Smooth transition indicator */}
      {selectedOrientation && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-purple-600 animate-bounce">
            <ArrowDown className="w-4 h-4" />
            <span className="text-sm font-medium">Now choose your size</span>
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Premium Size Selection */}
      {selectedOrientation && (
        <>
          <SizeHeader />
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-size-section
            role="radiogroup"
            aria-label="Canvas size options"
          >
            {sizeOptions[selectedOrientation]?.map(option => (
              <div key={option.size} className="transform transition-all duration-500 hover:-translate-y-2">
                <GlassMorphismSizeCard 
                  option={option} 
                  orientation={selectedOrientation}
                  isSelected={selectedSize === option.size} 
                  isRecommended={option.size === getRecommendedSize(selectedOrientation)}
                  userImageUrl={userImageUrl} 
                  onClick={() => handleSizeSelect(option.size)} 
                  onContinue={e => handleContinueWithSize(option.size, e)} 
                />
              </div>
            ))}
          </div>

          {/* Real-time Price Update */}
          {selectedSize && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <DollarSign className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  Starting at ${sizeOptions[selectedOrientation]?.find(opt => opt.size === selectedSize)?.salePrice || 99.99} for {selectedSize} canvas
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Final price will be calculated with your customizations
              </p>
            </div>
          )}
        </>
      )}

      {/* Step Navigation */}
      <StepNavigation
        canGoBack={canGoBack}
        canContinue={canContinueToNext}
        onBack={handleBackStep}
        onContinue={handleContinueClick}
        continueText="Continue to Customize"
        currentStep={currentStep}
        totalSteps={4}
      />
    </div>
  );
};

export default OrientationSelector;