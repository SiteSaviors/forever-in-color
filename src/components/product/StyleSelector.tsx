import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, ArrowLeft } from "lucide-react";
import IntelligentStyleGrid from "./components/IntelligentStyleGrid";
import { StylePreviewProvider } from "./contexts/StylePreviewContext";
import { artStyles } from "@/data/artStyles";

interface StyleSelectorProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  cropAspectRatio: number;
  selectedOrientation: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onRecropImage: () => void;
}

const StyleSelector = ({
  croppedImage,
  selectedStyle,
  cropAspectRatio,
  selectedOrientation,
  onStyleSelect,
  onComplete,
  onRecropImage
}: StyleSelectorProps) => {
  const handleComplete = () => {
    console.log('StyleSelector handleComplete called', {
      croppedImage,
      selectedStyle
    });
    if (croppedImage && selectedStyle) {
      const style = artStyles.find(s => s.id === selectedStyle);
      if (style) {
        console.log('Calling onComplete with:', croppedImage, selectedStyle, style.name);
        onComplete(croppedImage, selectedStyle, style.name);
      } else {
        console.error('Style not found for selectedStyle:', selectedStyle);
      }
    } else {
      console.error('Missing required data for completion:', {
        croppedImage,
        selectedStyle
      });
    }
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('StyleSelector handleStyleSelect called', {
      styleId,
      styleName
    });
    onStyleSelect(styleId, styleName);
  };

  return (
    <StylePreviewProvider croppedImage={croppedImage} selectedOrientation={selectedOrientation}>
      <div className="space-y-6">
        {/* Back to Crop Button - Prominent placement */}
        {croppedImage && onRecropImage && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={onRecropImage}
              className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 flex items-center gap-2 px-6 py-3 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Photo & Crop
            </Button>
          </div>
        )}

        {/* Enhanced notification when user has uploaded an image */}
        {croppedImage && (
          <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>✨ AI-Powered Style Discovery</strong> - Our intelligent system analyzed your photo and curated personalized recommendations just for you! Click any style to see instant previews.
            </AlertDescription>
          </Alert>
        )}

        {/* Intelligent Style Grid */}
        <IntelligentStyleGrid
          croppedImage={croppedImage}
          selectedStyle={selectedStyle}
          cropAspectRatio={cropAspectRatio}
          selectedOrientation={selectedOrientation}
          onStyleSelect={handleStyleSelect}
          onComplete={handleComplete}
        />
      </div>
    </StylePreviewProvider>
  );
};

export default StyleSelector;