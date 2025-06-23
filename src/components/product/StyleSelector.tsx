
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";
import StyleGrid from "./StyleGrid";
import { artStyles } from "@/data/artStyles";

interface StyleSelectorProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  preSelectedStyle?: {id: number, name: string} | null;
  cropAspectRatio?: number;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
}

const StyleSelector = ({ 
  croppedImage, 
  selectedStyle, 
  preSelectedStyle,
  cropAspectRatio = 1, // Use actual crop aspect ratio, default to square
  onStyleSelect, 
  onComplete 
}: StyleSelectorProps) => {

  const handleComplete = () => {
    console.log('StyleSelector handleComplete called', { croppedImage, selectedStyle });
    
    if (croppedImage && selectedStyle) {
      const style = artStyles.find(s => s.id === selectedStyle);
      if (style) {
        console.log('Calling onComplete with:', croppedImage, selectedStyle, style.name);
        onComplete(croppedImage, selectedStyle, style.name);
      } else {
        console.error('Style not found for selectedStyle:', selectedStyle);
      }
    } else {
      console.error('Missing required data for completion:', { croppedImage, selectedStyle });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-xl font-semibold text-gray-900 mb-2">
          Choose Your Art Style
        </h4>
        <p className="text-gray-600">
          {!croppedImage ? 
            "Here are all our incredible art styles. Upload your photo above to see live previews!" :
            "Click any style to see your photo transformed. Popular styles load instantly!"
          }
        </p>
      </div>

      {/* Helpful notification when user has uploaded an image */}
      {croppedImage && (
        <Alert className="border-purple-200 bg-purple-50">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>✨ Click any style</strong> to see your photo transformed with AI! Each style generates a unique preview just for you.
          </AlertDescription>
        </Alert>
      )}

      <StyleGrid
        croppedImage={croppedImage}
        selectedStyle={selectedStyle}
        cropAspectRatio={cropAspectRatio} // Pass the actual crop aspect ratio
        onStyleSelect={onStyleSelect}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default StyleSelector;
