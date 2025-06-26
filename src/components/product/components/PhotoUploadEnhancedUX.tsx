
import SmartProgressIndicator from "../progress/SmartProgressIndicator";
import ContextualHelp from "../help/ContextualHelp";
import SocialProofFeed from "../social/SocialProofFeed";
import ConversionMomentumTracker from "../progress/ConversionMomentumTracker";
import ProgressStateManager from "./ProgressStateManager";

interface PhotoUploadEnhancedUXProps {
  currentStep: number;
  completedSteps: number[];
  croppedImage: string | null;
  selectedStyle: { id: number; name: string } | null;
  shouldShowProgress: boolean;
}

const PhotoUploadEnhancedUX = ({
  currentStep,
  completedSteps,
  croppedImage,
  selectedStyle,
  shouldShowProgress
}: PhotoUploadEnhancedUXProps) => {
  return (
    <>
      {/* Progress State Manager */}
      <ProgressStateManager
        currentStep={currentStep}
        completedSteps={completedSteps}
        croppedImage={croppedImage}
        selectedStyle={selectedStyle}
      />

      {/* Smart Progress Indicator - Only show when we have meaningful progress */}
      {shouldShowProgress && (
        <SmartProgressIndicator uploadedImage={croppedImage} />
      )}

      {/* Enhanced UX Components */}
      <ContextualHelp />
      <SocialProofFeed />
      <ConversionMomentumTracker />
    </>
  );
};

export default PhotoUploadEnhancedUX;
