
import ValidationErrorAlert from "../orientation/components/ValidationErrorAlert";
import SizeSelectionSection from "../orientation/components/SizeSelectionSection";
import StepNavigation from "./StepNavigation";
import ProductStepWrapper from "./ProductStepWrapper";
import { useBackNavigation } from "../hooks/useBackNavigation";
import { useOrientationSelector } from "../orientation/hooks/useOrientationSelector";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target, Sparkles } from "@/components/ui/icons";

interface CanvasConfigurationStepProps {
  currentStep: number;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  selectedOrientation: string;
  selectedSize: string;
  uploadedImage: string | null;
  onStepClick: () => void;
  onOrientationSelect: (orientation: string) => void;
  onSizeSelect: (size: string) => void;
  onContinue: () => void;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

const CanvasConfigurationStep = ({
  currentStep,
  isActive,
  isCompleted,
  canAccess,
  selectedOrientation,
  selectedSize,
  uploadedImage,
  onStepClick,
  onOrientationSelect,
  onSizeSelect,
  onContinue,
  completedSteps,
  onStepChange
}: CanvasConfigurationStepProps) => {
  
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
    userImageUrl: uploadedImage,
    onOrientationChange: onOrientationSelect,
    onSizeChange: onSizeSelect,
    onContinue
  });

  return (
    <ProductStepWrapper
      stepNumber={2}
      title="Choose Your Canvas Size"
      description={`Perfect! Your ${selectedOrientation} canvas is ready. Now select the ideal size.`}
      isActive={isActive}
      isCompleted={isCompleted}
      canAccess={canAccess}
      onStepClick={onStepClick}
    >
      {currentStep === 2 && (
        <div className="space-y-8 font-poppins">
          {/* Enhanced Header with Size Focus */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-4 py-2 shadow-lg">
                <CheckCircle className="w-4 h-4 mr-2" />
                {selectedOrientation} Canvas Ready
              </Badge>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight font-poppins drop-shadow-sm">
                Choose Your Perfect Size
              </h2>
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold tracking-tight">Step 2 of 4</span>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-poppins tracking-tight">
                Your <span className="font-semibold text-purple-700">{selectedOrientation}</span> canvas orientation is locked in. 
                Now select the ideal size that will make your artwork truly shine in your space.
              </p>
            </div>

            {/* Size Context Helper */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-900 tracking-tight font-poppins drop-shadow-sm">
                  Size Guide
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 mb-1">12" - 16"</div>
                  <div className="text-blue-600 font-medium">Perfect for desks & shelves</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 mb-1">18" - 24"</div>
                  <div className="text-blue-600 font-medium">Great for walls & focal points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 mb-1">30"+</div>
                  <div className="text-blue-600 font-medium">Statement pieces & galleries</div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Error Alert */}
          <ValidationErrorAlert validationError={validationError} />

          {/* Size Selection Section - Enhanced */}
          <SizeSelectionSection
            ref={sizeSectionRef}
            selectedOrientation={selectedOrientation}
            selectedSize={selectedSize}
            recommendedSize={recommendedSize}
            currentSizeOption={currentSizeOption}
            onSizeSelect={handleSizeSelect}
            onContinueWithSize={handleContinueWithSize}
          />

          {/* Step Navigation - Enhanced */}
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
      )}
    </ProductStepWrapper>
  );
};

export default CanvasConfigurationStep;
