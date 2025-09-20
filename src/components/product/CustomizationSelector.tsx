
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
  isGeneratingPreviews?: boolean;
  previewError?: string | null;
}

const CustomizationSelector = ({
  selectedSize,
  customizations,
  onCustomizationChange,
  userArtworkUrl,
  selectedOrientation = 'square',
  previewUrls = {},
  selectedStyle,
  isGeneratingPreviews = false,
  previewError = null
}: CustomizationSelectorProps) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const { canvasFrame, artworkPosition } = useCanvasPreview(selectedOrientation);

  /**
   * Get the appropriate artwork URL - PRIORITIZE AI-GENERATED ART
   * PRIORITY: Generated AI artwork > Original uploaded photo (only as absolute fallback)
   */
  const getArtworkUrl = useMemo(() => {
    // PRIORITY 1: Generated preview URL for selected style (AI-generated artwork)
    if (selectedStyle?.id && previewUrls && typeof previewUrls === 'object') {
      // Try both number and string keys
      const previewUrl = previewUrls[selectedStyle.id] || previewUrls[String(selectedStyle.id)];
      if (previewUrl && typeof previewUrl === 'string') {
        return previewUrl;
      }
    }

    // PRIORITY 2: First available preview URL (any generated artwork)
    const availableUrls = Object.values(previewUrls || {}).filter(url => url && typeof url === 'string');
    if (availableUrls.length > 0) {
      return availableUrls[0];
    }

    // ONLY as absolute last resort: Direct user artwork URL (original uploaded photo)
    if (userArtworkUrl && typeof userArtworkUrl === 'string') {
      return userArtworkUrl;
    }

    return null;
  }, [selectedStyle, previewUrls, userArtworkUrl, isGeneratingPreviews]);

  // Log state changes for debugging
  useEffect(() => {
    // State tracking without console logging
  }, [getArtworkUrl, selectedStyle, previewUrls, canvasFrame, artworkPosition, isGeneratingPreviews]);

  const handleCustomizationUpdate = (updates: Partial<CustomizationConfig>) => {
    if (!hasInteracted) setHasInteracted(true);
    const newCustomizations = {
      ...customizations,
      ...updates
    };
    onCustomizationChange(newCustomizations);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <CustomizationHeader />
      
      {/* Canvas Preview Section - Show AI-generated artwork */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CanvasPreviewSection
          userArtworkUrl={getArtworkUrl}
          selectedOrientation={selectedOrientation}
          canvasFrame={canvasFrame}
          artworkPosition={artworkPosition}
          isLoading={isGeneratingPreviews && !getArtworkUrl}
          error={previewError}
        />

        {/* Customization Options */}
        <CustomizationOptionsComponent
          selectedSize={selectedSize}
          customizations={customizations}
          onCustomizationUpdate={handleCustomizationUpdate}
        />
      </div>

      {/* Show loading state if generating and no preview available */}
      {isGeneratingPreviews && !getArtworkUrl && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span className="text-sm text-gray-600">Generating AI artwork preview...</span>
          </div>
        </div>
      )}
      
      {/* Show error state if preview generation failed */}
      {previewError && !getArtworkUrl && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">
            Failed to generate AI artwork preview. Please try again.
          </p>
        </div>
      )}

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
