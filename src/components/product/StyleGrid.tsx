
import { memo, useState, useEffect } from "react";
import StyleGridContainer from "./components/StyleGrid/StyleGridContainer";
import PlaceholderGrid from "./components/StyleGrid/PlaceholderGrid";
import ActiveStyleGrid from "./components/StyleGrid/ActiveStyleGrid";
import StyleGridSkeleton from "./components/StyleGridSkeleton";
import { artStyles } from "@/data/artStyles";
import { preloadCriticalImages, smartPreload } from "@/utils/performanceUtils";

interface StyleGridProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  cropAspectRatio: number;
  selectedOrientation?: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

const StyleGrid = memo(({ 
  croppedImage, 
  selectedStyle, 
  cropAspectRatio,
  selectedOrientation = "square",
  onStyleSelect, 
  onComplete 
}: StyleGridProps) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);

  // Preload critical images on component mount
  useEffect(() => {
    const initializeImages = async () => {
      try {
        // Preload critical images first
        await preloadCriticalImages((progress) => {
          setPreloadProgress(progress);
        });

        // Preload style images
        const styleImages = artStyles.map(style => style.image);
        await smartPreload(styleImages);

        // Short delay to prevent flicker
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 150);
      } catch (error) {
        // Still show content even if preloading fails
        setIsInitialLoading(false);
      }
    };

    initializeImages();
  }, []);

  const handleStyleSelect = async (styleId: number, styleName: string) => {
    onStyleSelect(styleId, styleName);
  };

  // Show skeleton loading on initial load
  if (isInitialLoading) {
    return (
      <StyleGridContainer>
        {preloadProgress > 0 && (
          <div className="text-center text-sm text-gray-600 mb-4">
            Loading styles... {Math.round(preloadProgress)}%
          </div>
        )}
        <StyleGridSkeleton 
          count={artStyles.length} 
          aspectRatio={cropAspectRatio}
        />
      </StyleGridContainer>
    );
  }

  // Show placeholder thumbnails when no photo is uploaded
  if (!croppedImage) {
    return (
      <StyleGridContainer>
        <PlaceholderGrid cropAspectRatio={cropAspectRatio} />
      </StyleGridContainer>
    );
  }

  // Show actual style cards when photo is uploaded
  return (
    <StyleGridContainer>
      <ActiveStyleGrid
        croppedImage={croppedImage}
        selectedStyle={selectedStyle}
        cropAspectRatio={cropAspectRatio}
        selectedOrientation={selectedOrientation}
        onStyleSelect={handleStyleSelect}
        onComplete={onComplete}
      />
    </StyleGridContainer>
  );
});

StyleGrid.displayName = 'StyleGrid';

export default StyleGrid;
