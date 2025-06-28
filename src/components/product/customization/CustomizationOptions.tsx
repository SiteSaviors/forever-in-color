
import FloatingFrameCard from "./FloatingFrameCard";
import LivingMemoryCard from "./LivingMemoryCard";
import VoiceMatchCard from "./VoiceMatchCard";
import CustomMessageCard from "./CustomMessageCard";
import AIUpscaleCard from "./AIUpscaleCard";
import { CustomizationOptions as CustomizationConfig, CustomizationUpdateHandler } from "../types/customizationTypes";

interface CustomizationOptionsProps {
  selectedSize: string;
  customizations: CustomizationConfig;
  onCustomizationUpdate: CustomizationUpdateHandler;
}

const CustomizationOptions = ({
  selectedSize,
  customizations,
  onCustomizationUpdate
}: CustomizationOptionsProps) => {
  return (
    <div className="space-y-6">
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
