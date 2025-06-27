
import React from "react";
import OrientationHeader from "./orientation/components/OrientationHeader";
import ValidationErrorAlert from "./orientation/components/ValidationErrorAlert";
import SizeSelectionSection from "./orientation/components/SizeSelectionSection";
import StepNavigation from "./components/StepNavigation";
import { SizeSelectionProvider } from "./orientation/contexts/SizeSelectionContext";
import { useBackNavigation } from "./hooks/useBackNavigation";
import { useOrientationSelector } from "./orientation/hooks/useOrientationSelector";
import { OrientationSelectorProps } from "./orientation/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target, Sparkles } from "lucide-react";

interface ExtendedOrientationSelectorProps extends OrientationSelectorProps {
  userImageUrl?: string | null;
  currentStep?: number;
  completedSteps?: number[];
  onStepChange?: (step: number) => void;
}

const OrientationSelector: React.FC<ExtendedOrientationSelectorProps> = ({
  selectedOrientation,
  selectedSize,
  userImageUrl = null,
  onOrientationChange,
  onSizeChange,
  onContinue,
  currentStep = 2,
  completedSteps = [],
  onStepChange = () => {}
}) => {
  
  const { canGoBack, handleBackStep } = useBackNavigation({
    currentStep,
    completedSteps,
    onStepChange
  });

  const {
    validationError,
    sizeSectionRef,
    handleSizeSelect,
    handleContinueWithSize,
    handleContinueClick,
    recommendedSize,
    canContinueToNext,
    currentSizeOption
  } = useOrientationSelector({
    selectedOrientation,
    selectedSize,
    userImageUrl,
    onOrientationChange,
    onSizeChange,
    onContinue
  });

  return (
    <SizeSelectionProvider
      initialOrientation={selectedOrientation}
      onOrientationChange={onOrientationChange}
      onSizeChange={onSizeChange}
    >
      <div className="space-y-6 md:space-y-8 font-poppins">
        {/* Enhanced Header with Size Focus */}
        <div className="text-center space-y-4 md:space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-4 py-2 shadow-lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              {selectedOrientation} Canvas Ready
            </Badge>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight font-poppins">
              Choose Your Perfect Size
            </h2>
            <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
              <Target className="w-5 h-5" />
              <span className="font-semibold tracking-tight">Step 2 of 4</span>
            </div>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-poppins px-4">
              Your <span className="font-semibold text-purple-700">{selectedOrientation}</span> canvas orientation is locked in. 
              Now select the ideal size that will make your artwork truly shine in your space.
            </p>
          </div>

          {/* Size Context Helper - Mobile Optimized */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-6 border border-blue-100 shadow-sm mx-4 md:mx-0">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-900 tracking-tight font-poppins">
                Size Guide
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-sm">
              <div className="text-center p-2">
                <div className="text-xl md:text-2xl font-bold text-blue-700 mb-1">12" - 16"</div>
                <div className="text-blue-600 font-medium">Perfect for desks & shelves</div>
              </div>
              <div className="text-center p-2">
                <div className="text-xl md:text-2xl font-bold text-blue-700 mb-1">18" - 24"</div>
                <div className="text-blue-600 font-medium">Great for walls & focal points</div>
              </div>
              <div className="text-center p-2">
                <div className="text-xl md:text-2xl font-bold text-blue-700 mb-1">30"+</div>
                <div className="text-blue-600 font-medium">Statement pieces & galleries</div>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Error Alert */}
        <ValidationErrorAlert validationError={validationError} />

        {/* Size Selection Section - Enhanced with Context */}
        <SizeSelectionSection
          ref={sizeSectionRef}
          selectedOrientation={selectedOrientation}
          selectedSize={selectedSize}
          recommendedSize={recommendedSize}
          currentSizeOption={currentSizeOption}
          onSizeSelect={handleSizeSelect}
          onContinueWithSize={handleContinueWithSize}
        />

        {/* Step Navigation - Enhanced with Mobile Optimization */}
        <div className="px-4 md:px-0">
          <StepNavigation
            canGoBack={canGoBack}
            canContinue={canContinueToNext}
            onBack={handleBackStep}
            onContinue={handleContinueClick}
            continueText="Continue to Customize →"
            currentStep={currentStep}
            totalSteps={4}
          />
        </div>
      </div>
    </SizeSelectionProvider>
  );
};

export default OrientationSelector;
