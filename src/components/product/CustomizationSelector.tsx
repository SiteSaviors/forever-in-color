
import { useState, useEffect } from "react";
import CustomizationHeader from "./customization/CustomizationHeader";
import LivingMemoryShowcase from "./customization/LivingMemoryShowcase";
import PremiumVideoOptions from "./customization/PremiumVideoOptions";
import SocialProofGallery from "./customization/SocialProofGallery";
import FloatingFrameCard from "./customization/FloatingFrameCard";
import VoiceMatchCard from "./customization/VoiceMatchCard";
import CustomMessageCard from "./customization/CustomMessageCard";
import AIUpscaleCard from "./customization/AIUpscaleCard";
import StepNavigation from "./components/StepNavigation";
import { useBackNavigation } from "./hooks/useBackNavigation";

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

interface CustomizationSelectorProps {
  selectedSize: string;
  customizations: CustomizationOptions;
  onCustomizationChange: (customizations: CustomizationOptions) => void;
  currentStep?: number;
  completedSteps?: number[];
  onStepChange?: (step: number) => void;
  onContinue?: () => void;
}

const CustomizationSelector = ({ 
  selectedSize, 
  customizations, 
  onCustomizationChange,
  currentStep = 3,
  completedSteps = [],
  onStepChange = () => {},
  onContinue = () => {}
}: CustomizationSelectorProps) => {
  const [message, setMessage] = useState(customizations.customMessage);
  const [premiumVideoOptions, setPremiumVideoOptions] = useState({
    voiceMatching: false,
    backgroundAudio: 'none',
    videoLength: 5,
    voiceEnhancement: false
  });

  const { canGoBack, handleBackStep } = useBackNavigation({
    currentStep,
    completedSteps,
    onStepChange
  });

  console.log('🐛 CustomizationSelector rendered with:', {
    selectedSize,
    customizations,
    currentStep,
    completedSteps
  });

  const updateCustomization = (key: keyof CustomizationOptions, value: any) => {
    console.log('🐛 Updating customization:', key, value);
    const newCustomizations = {
      ...customizations,
      [key]: value
    };

    // If Living Memory is being disabled, also disable dependent options
    if (key === 'livingMemory' && !value) {
      newCustomizations.voiceMatch = false;
      newCustomizations.customMessage = '';
      setMessage('');
    }

    onCustomizationChange(newCustomizations);
  };

  const updateFrameOption = (key: keyof CustomizationOptions['floatingFrame'], value: any) => {
    console.log('🐛 Updating frame option:', key, value);
    onCustomizationChange({
      ...customizations,
      floatingFrame: {
        ...customizations.floatingFrame,
        [key]: value
      }
    });
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    updateCustomization('customMessage', value);
  };

  // Auto-mark step 3 as completed when any customization is made
  useEffect(() => {
    console.log('🐛 CustomizationSelector effect - marking step 3 as completed');
    // This will be handled by the parent component when onCustomizationChange is called
  }, []);

  const canContinue = true; // Customization step is optional

  return (
    <div className="space-y-8">
      <CustomizationHeader />

      {/* Living Memory Showcase - Hero Section */}
      <LivingMemoryShowcase
        enabled={customizations.livingMemory}
        onEnabledChange={(enabled) => updateCustomization('livingMemory', enabled)}
      />

      {/* Premium Video Options - Only show if Living Memory is enabled */}
      <PremiumVideoOptions
        livingMemoryEnabled={customizations.livingMemory}
        options={premiumVideoOptions}
        onOptionsChange={setPremiumVideoOptions}
      />

      {/* Social Proof Gallery */}
      <SocialProofGallery />

      {/* Other Customizations */}
      <div className="grid gap-6">
        <FloatingFrameCard
          enabled={customizations.floatingFrame.enabled}
          color={customizations.floatingFrame.color}
          selectedSize={selectedSize}
          onEnabledChange={(enabled) => updateFrameOption('enabled', enabled)}
          onColorChange={(color) => updateFrameOption('color', color)}
        />

        <VoiceMatchCard
          enabled={customizations.voiceMatch}
          livingMemoryEnabled={customizations.livingMemory}
          onEnabledChange={(enabled) => updateCustomization('voiceMatch', enabled)}
        />

        <CustomMessageCard
          message={message}
          livingMemoryEnabled={customizations.livingMemory}
          onMessageChange={handleMessageChange}
        />

        <AIUpscaleCard
          enabled={customizations.aiUpscale}
          onEnabledChange={(enabled) => updateCustomization('aiUpscale', enabled)}
        />
      </div>

      {/* Step Navigation */}
      <StepNavigation
        canGoBack={canGoBack}
        canContinue={canContinue}
        onBack={handleBackStep}
        onContinue={() => {
          console.log('🐛 CustomizationSelector: Continue to step 4');
          onContinue();
        }}
        continueText="Review & Order"
        currentStep={currentStep}
        totalSteps={4}
      />
    </div>
  );
};

export default CustomizationSelector;
