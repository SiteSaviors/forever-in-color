import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import FloatingFrameCard from "./customization/FloatingFrameCard";
import LivingMemoryCard from "./customization/LivingMemoryCard";
import VoiceMatchCard from "./customization/VoiceMatchCard";
import CustomMessageCard from "./customization/CustomMessageCard";
import AIUpscaleCard from "./customization/AIUpscaleCard";
import CustomizationHeader from "./customization/CustomizationHeader";
import LiveActivityFeed from "./customization/LiveActivityFeed";
import SocialProofGallery from "./customization/SocialProofGallery";
import PremiumVideoOptions from "./customization/PremiumVideoOptions";

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

  const handleCustomizationUpdate = (updates: Partial<CustomizationOptions>) => {
    if (!hasInteracted) setHasInteracted(true);
    const newCustomizations = {
      ...customizations,
      ...updates
    };
    onCustomizationChange(newCustomizations);
    console.log('🎨 Customizations updated:', newCustomizations);
  };

  // Get proper canvas frame based on orientation
  const getCanvasFrame = () => {
    switch (selectedOrientation) {
      case 'horizontal':
        return '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png';
      case 'vertical':
        return '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png';
      case 'square':
      default:
        return '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png';
    }
  };

  // Get positioning for artwork overlay based on orientation
  const getArtworkPosition = () => {
    switch (selectedOrientation) {
      case 'horizontal':
        return {
          top: '18%',
          left: '15%',
          width: '70%',
          height: '64%'
        };
      case 'vertical':
        return {
          top: '15%',
          left: '20%',
          width: '60%',
          height: '70%'
        };
      case 'square':
      default:
        return {
          top: '5.2%',
          left: '4.7%',
          width: '89.3%',
          height: '89.3%'
        };
    }
  };

  const calculateTotalPrice = () => {
    let basePrice = 149; // Base canvas price
    let total = basePrice;
    
    if (customizations.floatingFrame.enabled) total += 79;
    if (customizations.livingMemory) total += 29;
    if (customizations.voiceMatch) total += 19;
    if (customizations.aiUpscale) total += 15;
    
    return {
      basePrice,
      total
    };
  };

  const { basePrice, total } = calculateTotalPrice();
  const savings = total > basePrice ? Math.round((total - basePrice) * 0.2) : 0;
  const canvasFrame = getCanvasFrame();
  const artworkPosition = getArtworkPosition();

  console.log('🖼️ CustomizationSelector Debug:', {
    userArtworkUrl,
    selectedOrientation,
    canvasFrame,
    artworkPosition
  });

  return <div className="max-w-6xl mx-auto space-y-8">
      <CustomizationHeader />
      
      {/* Canvas Preview Section - Expanded canvas mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Canvas Mockups Only - Expanded to fill column */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Canvas Preview</h3>
            <p className="text-gray-600">Premium gallery-quality canvas with your artwork</p>
          </div>
          
          {/* Expanded Canvas Mockup with User Artwork Overlay */}
          <div className="relative group">
            {/* Canvas Frame */}
            <img 
              src={canvasFrame}
              alt="Canvas Mockup" 
              className="w-full h-auto rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02]" 
            />
            
            {/* User's Generated Artwork Overlay */}
            {userArtworkUrl && (
              <div 
                className="absolute overflow-hidden transition-all duration-300 group-hover:brightness-110 rounded-sm"
                style={artworkPosition}
              >
                <img 
                  src={userArtworkUrl}
                  alt="Your generated artwork"
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                  style={{
                    filter: 'brightness(0.95) contrast(1.05) saturate(1.1)'
                  }}
                  onLoad={() => console.log('✅ User artwork loaded successfully:', userArtworkUrl)}
                  onError={(e) => console.error('❌ Failed to load user artwork:', userArtworkUrl, e)}
                />
              </div>
            )}
            
            {/* Debug overlay to show artwork position */}
            {!userArtworkUrl && (
              <div 
                className="absolute border-2 border-dashed border-red-300 bg-red-50/50 flex items-center justify-center text-red-600 text-sm font-medium"
                style={artworkPosition}
              >
                No artwork URL provided
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-900">Premium Quality</span>
            </div>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Museum-grade canvas material</li>
              <li>• Fade-resistant archival inks</li>
              <li>• Hand-stretched wooden frame</li>
              <li>• Ready to hang hardware included</li>
            </ul>
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-6">
          <FloatingFrameCard 
            enabled={customizations.floatingFrame.enabled} 
            color={customizations.floatingFrame.color} 
            selectedSize={selectedSize} 
            onEnabledChange={enabled => handleCustomizationUpdate({
              floatingFrame: {
                ...customizations.floatingFrame,
                enabled
              }
            })} 
            onColorChange={color => handleCustomizationUpdate({
              floatingFrame: {
                ...customizations.floatingFrame,
                color
              }
            })} 
          />

          <LivingMemoryCard 
            enabled={customizations.livingMemory} 
            onEnabledChange={enabled => handleCustomizationUpdate({
              livingMemory: enabled
            })} 
          />

          <VoiceMatchCard 
            enabled={customizations.voiceMatch} 
            livingMemoryEnabled={customizations.livingMemory} 
            onEnabledChange={enabled => handleCustomizationUpdate({
              voiceMatch: enabled
            })} 
          />

          <CustomMessageCard 
            message={customizations.customMessage} 
            livingMemoryEnabled={customizations.livingMemory} 
            onMessageChange={message => handleCustomizationUpdate({
              customMessage: message
            })} 
          />

          <AIUpscaleCard 
            enabled={customizations.aiUpscale} 
            onEnabledChange={enabled => handleCustomizationUpdate({
              aiUpscale: enabled
            })} 
          />
        </div>
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
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-gray-900">Your Custom Canvas</span>
            <Badge className="bg-green-500 text-white">
              {savings > 0 ? `Save $${savings}` : 'Premium Quality'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Canvas ({selectedSize})</span>
            <span className="font-semibold">${basePrice}</span>
          </div>
          
          {customizations.floatingFrame.enabled && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Floating Frame</span>
              <span className="font-semibold">+$79</span>
            </div>
          )}
          
          {customizations.livingMemory && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Living Memory</span>
              <span className="font-semibold">+$29</span>
            </div>
          )}
          
          {customizations.voiceMatch && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Voice Match</span>
              <span className="font-semibold">+$19</span>
            </div>
          )}
          
          {customizations.aiUpscale && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">AI Upscale</span>
              <span className="font-semiboral">+$15</span>
            </div>
          )}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-purple-600">${total}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};

export default CustomizationSelector;
