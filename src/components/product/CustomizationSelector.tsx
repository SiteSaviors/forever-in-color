
import { useState } from "react";
import CustomizationHeader from "./customization/CustomizationHeader";
import FloatingFrameCard from "./customization/FloatingFrameCard";
import LivingMemoryCard from "./customization/LivingMemoryCard";
import VoiceMatchCard from "./customization/VoiceMatchCard";
import CustomMessageCard from "./customization/CustomMessageCard";
import AIUpscaleCard from "./customization/AIUpscaleCard";

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
}

const CustomizationSelector = ({ 
  selectedSize, 
  customizations, 
  onCustomizationChange 
}: CustomizationSelectorProps) => {
  const [message, setMessage] = useState(customizations.customMessage);

  const updateCustomization = (key: keyof CustomizationOptions, value: any) => {
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

  return (
    <div className="space-y-8">
      <CustomizationHeader />

      <div className="grid gap-8">
        <FloatingFrameCard
          enabled={customizations.floatingFrame.enabled}
          color={customizations.floatingFrame.color}
          selectedSize={selectedSize}
          onEnabledChange={(enabled) => updateFrameOption('enabled', enabled)}
          onColorChange={(color) => updateFrameOption('color', color)}
        />

        <LivingMemoryCard
          enabled={customizations.livingMemory}
          onEnabledChange={(enabled) => updateCustomization('livingMemory', enabled)}
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
    </div>
  );
};

export default CustomizationSelector;
