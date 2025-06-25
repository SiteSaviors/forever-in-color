
import { useEffect, useState } from "react";
import { artStyles } from "@/data/artStyles";
import { usePreviewGeneration } from "./hooks/usePreviewGeneration";
import { StyleCardContextProvider } from "./contexts/StyleCardContext";
import SimplifiedStyleCard from "./components/SimplifiedStyleCard";

interface StyleGridProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
}

const StyleGrid = ({ 
  croppedImage, 
  selectedStyle, 
  onStyleSelect, 
  onComplete 
}: StyleGridProps) => {
  const [selectedOrientation, setSelectedOrientation] = useState("square");
  const [shouldBlur, setShouldBlur] = useState(false);

  // Get auto-generated previews
  const { previewUrls, autoGenerationComplete } = usePreviewGeneration(
    croppedImage, 
    selectedOrientation
  );

  // Debug logging to check what's happening with preview URLs
  useEffect(() => {
    console.log('🔍 StyleGrid Debug:', {
      croppedImage: croppedImage ? croppedImage.substring(0, 50) + '...' : null,
      selectedStyle,
      previewUrls,
      autoGenerationComplete,
      selectedOrientation
    });
  }, [croppedImage, selectedStyle, previewUrls, autoGenerationComplete, selectedOrientation]);

  const handleStyleClick = (style: { id: number; name: string; description: string; image: string }) => {
    console.log('🎯 StyleGrid: Style clicked:', style.name, 'ID:', style.id);
    onStyleSelect(style.id, style.name);
  };

  const handleContinue = () => {
    if (croppedImage && selectedStyle) {
      const style = artStyles.find(s => s.id === selectedStyle);
      if (style) {
        console.log('📋 StyleGrid: Continuing with style:', style.name, 'Image:', croppedImage.substring(0, 50) + '...');
        onComplete(croppedImage, selectedStyle, style.name);
      }
    }
  };

  // Enhanced context value with preview URLs
  const contextValue = {
    croppedImage,
    selectedStyle,
    selectedOrientation,
    shouldBlur,
    previewUrls, // Pass the preview URLs to context
    autoGenerationComplete,
    onStyleClick: handleStyleClick,
    onContinue: handleContinue
  };

  return (
    <StyleCardContextProvider value={contextValue}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artStyles.map((style) => {
          const isPopular = [2, 4, 5].includes(style.id);
          
          return (
            <SimplifiedStyleCard
              key={style.id}
              style={style}
              isPopular={isPopular}
            />
          );
        })}
      </div>
    </StyleCardContextProvider>
  );
};

export default StyleGrid;
