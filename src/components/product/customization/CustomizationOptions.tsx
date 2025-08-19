
import FloatingFrameCard from "./FloatingFrameCard";
import LivingMemoryCard from "./LivingMemoryCard";
import VoiceMatchCard from "./VoiceMatchCard";
import CustomMessageCard from "./CustomMessageCard";
import AIUpscaleCard from "./AIUpscaleCard";

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

interface CustomizationOptionsProps {
  selectedSize: string;
  customizations: CustomizationOptions;
  onCustomizationUpdate: (updates: Partial<CustomizationOptions>) => void;
}

const CustomizationOptions = ({
  selectedSize,
  customizations,
  onCustomizationUpdate
}: CustomizationOptionsProps) => {
  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <FloatingFrameCard 
        enabled={customizations.floatingFrame.enabled} 
        color={customizations.floatingFrame.color} 
        selectedSize={selectedSize} 
        onEnabledChange={enabled => onCustomizationUpdate({
          floatingFrame: {
            ...customizations.floatingFrame,
            enabled
          }
        })} 
        onColorChange={color => onCustomizationUpdate({
          floatingFrame: {
            ...customizations.floatingFrame,
            color
          }
        })} 
      />

      <LivingMemoryCard 
        enabled={customizations.livingMemory} 
        onEnabledChange={enabled => onCustomizationUpdate({
          livingMemory: enabled
        })} 
      />

      <VoiceMatchCard 
        enabled={customizations.voiceMatch} 
        livingMemoryEnabled={customizations.livingMemory} 
        onEnabledChange={enabled => onCustomizationUpdate({
          voiceMatch: enabled
        })} 
      />

      <CustomMessageCard 
        message={customizations.customMessage} 
        livingMemoryEnabled={customizations.livingMemory} 
        onMessageChange={message => onCustomizationUpdate({
          customMessage: message
        })} 
      />

      <AIUpscaleCard 
        enabled={customizations.aiUpscale} 
        onEnabledChange={enabled => onCustomizationUpdate({
          aiUpscale: enabled
        })} 
      />
    </div>
  );
};

export default CustomizationOptions;
