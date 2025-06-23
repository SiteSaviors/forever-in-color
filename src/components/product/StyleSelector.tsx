
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Crop, RotateCcw } from "lucide-react";
import StyleGrid from "./StyleGrid";
import { artStyles } from "@/data/artStyles";

interface StyleSelectorProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  preSelectedStyle?: {id: number, name: string} | null;
  cropAspectRatio?: number;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onRecropImage?: () => void;
}

const StyleSelector = ({ 
  croppedImage, 
  selectedStyle, 
  preSelectedStyle,
  cropAspectRatio = 1, // Use actual crop aspect ratio, default to square
  onStyleSelect, 
  onComplete,
  onRecropImage
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

  const getOrientationName = () => {
    if (cropAspectRatio === 1) return "Square";
    if (cropAspectRatio > 1) return "Horizontal";
    return "Vertical";
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

      {/* Crop Info & Recrop Option */}
      {croppedImage && onRecropImage && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Crop className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Current crop: {getOrientationName()}
              </p>
              <p className="text-xs text-gray-600">
                Your photo is cropped and ready for styling
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRecropImage}
            className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Change Crop
          </Button>
        </div>
      )}

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
