
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
import { useState, useCallback } from "react";

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

  // FIXED: Add debounced state to prevent rapid updates
  const [isUpdating, setIsUpdating] = useState(false);

  // FIXED: Debounced orientation handler to prevent layout thrashing
  const handleOrientationSelect = useCallback((orientation: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    onOrientationChange(orientation);
    onSizeChange(""); // Reset size when orientation changes
    
    // Debounce to prevent rapid state changes
    setTimeout(() => setIsUpdating(false), 200);
  }, [onOrientationChange, onSizeChange, isUpdating]);
  
  // FIXED: Stable size selection handler
  const handleSizeSelect = useCallback((size: string) => {
    if (isUpdating) return;
    onSizeChange(size);
  }, [onSizeChange, isUpdating]);
  
  // FIXED: Improved continue handler with proper event management
  const handleContinueWithSize = useCallback((size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isUpdating) return;
    
    onSizeChange(size);
    if (onContinue) {
      // Delay to ensure state update completes
      setTimeout(() => onContinue(), 50);
    }
  }, [onSizeChange, onContinue, isUpdating]);

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

  const canContinueToNext = Boolean(selectedOrientation && selectedSize && !isUpdating);

  const getSizePrice = (size: string) => {
    switch (size) {
      case "8x10": return 49;
      case "12x16": return 89;
      case "16x20": return 129;
      case "20x24": return 169;
      default: return 49;
    }
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <OrientationHeader selectedOrientation={selectedOrientation} />

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

      {/* FIXED: Stable orientation cards with improved spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {orientationOptions.map(orientation => (
          <div key={orientation.id} className="transform transition-transform duration-300 hover:-translate-y-1">
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

      {/* FIXED: Stable size selection with improved layout */}
      {selectedOrientation && (
        <>
          <SizeHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {sizeOptions[selectedOrientation]?.map(option => (
              <div key={option.size} className="transform transition-transform duration-300 hover:-translate-y-1">
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
                  Starting at ${getSizePrice(selectedSize)} for {selectedSize} canvas
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
        onContinue={() => {
          if (onContinue && !isUpdating) onContinue();
        }}
        continueText="Continue to Customize"
        currentStep={currentStep}
        totalSteps={4}
      />
    </div>
  );
};

export default OrientationSelector;
