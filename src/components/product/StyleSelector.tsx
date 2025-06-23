
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  cropAspectRatio = 1,
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

      <StyleGrid
        croppedImage={croppedImage}
        selectedStyle={selectedStyle}
        cropAspectRatio={cropAspectRatio}
        onStyleSelect={onStyleSelect}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default StyleSelector;
