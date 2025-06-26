
import { useState, useMemo, useEffect } from "react";
import CustomizationHeader from "./customization/CustomizationHeader";
import LiveActivityFeed from "./customization/LiveActivityFeed";
import SocialProofGallery from "./customization/SocialProofGallery";
import PremiumVideoOptions from "./customization/PremiumVideoOptions";
import CanvasPreviewSection from "./customization/CanvasPreviewSection";
import CustomizationOptionsComponent from "./customization/CustomizationOptions";
import PricingSummary from "./customization/PricingSummary";
import { useCanvasPreview } from "./customization/hooks/useCanvasPreview";

interface CustomizationConfig {
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
  customizations: CustomizationConfig;
  onCustomizationChange: (customizations: CustomizationConfig) => void;
  userArtworkUrl?: string | null;
  selectedOrientation?: string;
  previewUrls?: { [key: number]: string };
  selectedStyle?: { id: number; name: string } | null;
}

const CustomizationSelector = ({
  selectedSize,
  customizations,
  onCustomizationChange,
  userArtworkUrl,
  selectedOrientation = 'square',
  previewUrls = {},
  selectedStyle
}: CustomizationSelectorProps) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const { canvasFrame, artworkPosition } = useCanvasPreview(selectedOrientation);

  /**
   * Get the appropriate artwork URL based on availability
   * Priority: Direct userArtworkUrl > Generated preview > null
   */
  const getArtworkUrl = useMemo(() => {
    console.log('🖼️ CustomizationSelector - Artwork URL Resolution:', {
      userArtworkUrl,
      selectedStyleId: selectedStyle?.id,
      previewUrls,
      previewUrlsKeys: Object.keys(previewUrls || {}),
      previewUrlsLength: Object.keys(previewUrls || {}).length
    });

    // Priority 1: Direct user artwork URL (uploaded image)
    if (userArtworkUrl && typeof userArtworkUrl === 'string') {
      console.log('✅ Using direct userArtworkUrl:', userArtworkUrl);
      return userArtworkUrl;
    }

    // Priority 2: Generated preview URL for selected style
    if (selectedStyle?.id && previewUrls && typeof previewUrls === 'object') {
      const previewUrl = previewUrls[selectedStyle.id] || previewUrls[String(selectedStyle.id)];
      if (previewUrl) {
        console.log('✅ Using preview URL for style:', selectedStyle.id, '->', previewUrl);
        return previewUrl;
      } else {
        console.log('⚠️ No preview URL found for selected style:', selectedStyle.id);
        console.log('Available preview URLs:', Object.keys(previewUrls));
      }
    }

    // Priority 3: First available preview URL (fallback)
    const availableUrls = Object.values(previewUrls || {});
    if (availableUrls.length > 0 && availableUrls[0]) {
      console.log('⚠️ Using first available preview URL as fallback:', availableUrls[0]);
      return availableUrls[0];
    }

    console.log('❌ No artwork URL available');
    return null;
  }, [userArtworkUrl, selectedStyle, previewUrls]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('🖼️ CustomizationSelector State Update:', {
      finalArtworkUrl: getArtworkUrl,
      selectedStyle: selectedStyle,
      previewUrlsCount: Object.keys(previewUrls || {}).length,
      canvasFrame,
      artworkPosition
    });
  }, [getArtworkUrl, selectedStyle, previewUrls, canvasFrame, artworkPosition]);

  const handleCustomizationUpdate = (updates: Partial<CustomizationConfig>) => {
    if (!hasInteracted) setHasInteracted(true);
    const newCustomizations = {
      ...customizations,
      ...updates
    };
    onCustomizationChange(newCustomizations);
    console.log('🎨 Customizations updated:', newCustomizations);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <CustomizationHeader />
      
      {/* Canvas Preview Section - Expanded canvas mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Canvas Mockups Only - Expanded to fill column */}
        <CanvasPreviewSection
          userArtworkUrl={getArtworkUrl}
          selectedOrientation={selectedOrientation}
          canvasFrame={canvasFrame}
          artworkPosition={artworkPosition}
        />

        {/* Customization Options */}
        <CustomizationOptionsComponent
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
