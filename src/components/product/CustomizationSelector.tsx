
import { useState } from "react";
import CustomizationHeader from "./customization/CustomizationHeader";
import LiveActivityFeed from "./customization/LiveActivityFeed";
import SocialProofGallery from "./customization/SocialProofGallery";
import PremiumVideoOptions from "./customization/PremiumVideoOptions";
import CanvasPreviewSection from "./customization/CanvasPreviewSection";
import CustomizationOptions from "./customization/CustomizationOptions";
import PricingSummary from "./customization/PricingSummary";
import { useCanvasPreview } from "./customization/hooks/useCanvasPreview";

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
  userArtworkUrl?: string | null;
  selectedOrientation?: string;
}

const CustomizationSelector = ({
  selectedSize,
  customizations,
  onCustomizationChange,
  userArtworkUrl,
  selectedOrientation = 'square'
}: CustomizationSelectorProps) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const { canvasFrame, artworkPosition } = useCanvasPreview(selectedOrientation);

  const handleCustomizationUpdate = (updates: Partial<CustomizationOptions>) => {
    if (!hasInteracted) setHasInteracted(true);
    const newCustomizations = {
      ...customizations,
      ...updates
    };
    onCustomizationChange(newCustomizations);
    console.log('🎨 Customizations updated:', newCustomizations);
  };

  console.log('🖼️ CustomizationSelector Debug:', {
    userArtworkUrl,
    selectedOrientation,
    canvasFrame,
    artworkPosition
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <CustomizationHeader />
      
      {/* Canvas Preview Section - Expanded canvas mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Canvas Mockups Only - Expanded to fill column */}
        <CanvasPreviewSection
          userArtworkUrl={userArtworkUrl}
          selectedOrientation={selectedOrientation}
          canvasFrame={canvasFrame}
          artworkPosition={artworkPosition}
        />

        {/* Customization Options */}
        <CustomizationOptions
          selectedSize={selectedSize}
          customizations={customizations}
          onCustomizationUpdate={handleCustomizationUpdate}
        />
      </div>

      {/* Social Proof & Video Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SocialProofGallery />
        <PremiumVideoOptions 
          livingMemoryEnabled={customizations.livingMemory} 
          options={{
            voiceMatching: false,
            backgroundAudio: 'none',
            videoLength: 30,
            voiceEnhancement: false
          }} 
          onOptionsChange={() => {}} 
        />
      </div>

      {/* Live Activity Feed */}
      <LiveActivityFeed />

      {/* Pricing Summary */}
      <PricingSummary
        selectedSize={selectedSize}
        customizations={customizations}
      />
    </div>
  );
};

export default CustomizationSelector;
