
import { useState, useEffect } from "react";
import { StyleCardProvider } from "./contexts/StyleCardContext";
import SimplifiedStyleCard from "./components/SimplifiedStyleCard";
import { StylePreviewProvider } from "./contexts/StylePreviewContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Style {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface StyleGridSimplifiedProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  selectedOrientation?: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

const styles: Style[] = [
  { id: 1, name: "Original Image", description: "Keep your photo exactly as it is", image: "/placeholder.svg" },
  { id: 2, name: "Classic Oil Painting", description: "Traditional oil painting style", image: "/placeholder.svg" },
  { id: 4, name: "Watercolor Dreams", description: "Soft watercolor effects", image: "/placeholder.svg" },
  { id: 5, name: "Pastel Bliss", description: "Gentle pastel tones", image: "/placeholder.svg" },
  { id: 6, name: "Gemstone Poly", description: "Geometric crystal effects", image: "/placeholder.svg" },
  { id: 7, name: "3D Storybook", description: "Whimsical 3D illustration", image: "/placeholder.svg" },
  { id: 8, name: "Artisan Charcoal", description: "Classic charcoal sketch", image: "/placeholder.svg" },
  { id: 9, name: "Pop Art Burst", description: "Bold pop art style", image: "/placeholder.svg" },
  { id: 10, name: "Neon Splash", description: "Electric neon effects", image: "/placeholder.svg" },
  { id: 11, name: "Electric Bloom", description: "Dynamic floral energy", image: "/placeholder.svg" },
  { id: 13, name: "Abstract Fusion", description: "Modern abstract interpretation", image: "/placeholder.svg" },
  { id: 15, name: "Deco Luxe", description: "Art Deco elegance", image: "/placeholder.svg" }
];

const StyleGridSimplified = ({
  croppedImage,
  selectedStyle,
  selectedOrientation = "square",
  onStyleSelect,
  onComplete
}: StyleGridSimplifiedProps) => {
  const [localSelectedStyle, setLocalSelectedStyle] = useState<number | null>(selectedStyle);

  useEffect(() => {
    setLocalSelectedStyle(selectedStyle);
  }, [selectedStyle]);

  const handleStyleClick = (style: Style) => {
    console.log(`🎯 Style selected: ${style.name} (ID: ${style.id})`);
    setLocalSelectedStyle(style.id);
    onStyleSelect(style.id, style.name);
  };

  const handleContinue = () => {
    console.log('🎯 Continue to next step');
    onComplete();
  };

  const canContinue = Boolean(croppedImage && localSelectedStyle);

  // Create the context value object that matches StyleCardContextType
  const contextValue = {
    croppedImage,
    selectedStyle: localSelectedStyle,
    selectedOrientation,
    shouldBlur: !!croppedImage,
    previewUrls: {}, // Empty for now, will be populated by auto-generation
    autoGenerationComplete: false,
    onStyleClick: handleStyleClick,
    onContinue: handleContinue
  };

  return (
    <StylePreviewProvider croppedImage={croppedImage} selectedOrientation={selectedOrientation}>
      <StyleCardProvider value={contextValue}>
        <div className="space-y-6">
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {styles.map((style) => (
              <SimplifiedStyleCard
                key={style.id}
                style={style}
                isPopular={[2, 4, 9].includes(style.id)}
              />
            ))}
          </div>

          {/* Continue Button */}
          {canContinue && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
              >
                Continue to Layout & Size
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </StyleCardProvider>
    </StylePreviewProvider>
  );
};

export default StyleGridSimplified;
