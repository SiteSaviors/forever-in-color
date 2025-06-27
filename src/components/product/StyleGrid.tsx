import { memo, useState, useEffect, useMemo, useCallback } from "react";
import StyleGridContainer from "./components/StyleGrid/StyleGridContainer";
import PlaceholderGrid from "./components/StyleGrid/PlaceholderGrid";
import OptimizedActiveStyleGrid from "./components/StyleGrid/OptimizedActiveStyleGrid";
import StyleGridSkeleton from "./components/StyleGridSkeleton";
import { artStyles } from "@/data/artStyles";
import { preloadCriticalImages, smartPreload } from "@/utils/performanceUtils";
import { useDebounce } from "./hooks/useDebounce";

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

  // Debounced style selection handler
  const debouncedOnStyleSelect = useDebounce(onStyleSelect, 100);

  // Memoized style images for preloading
  const styleImages = useMemo(() => 
    artStyles.map(style => style.image), 
    []
  );

  // Preload critical images on component mount
  useEffect(() => {
    const initializeImages = async () => {
      try {
        // Preload critical images first
        await preloadCriticalImages((progress) => {
          setPreloadProgress(progress);
        });

        // Preload style images with smart loading
        await smartPreload(styleImages);

        // Short delay to prevent flicker
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 150);
      } catch (error) {
        console.warn('Image preloading failed:', error);
        // Still show content even if preloading fails
        setIsInitialLoading(false);
      }
    };

    initializeImages();
  }, [styleImages]);

  const handleStyleSelect = useCallback(async (styleId: number, styleName: string) => {
    console.log('🎯 StyleGrid handleStyleSelect called:', styleId, styleName, 'with orientation:', selectedOrientation);
    debouncedOnStyleSelect(styleId, styleName);
  }, [selectedOrientation, debouncedOnStyleSelect]);

  // Memoized loading display
  const loadingDisplay = useMemo(() => (
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
  ), [preloadProgress, cropAspectRatio]);

  // Memoized placeholder display
  const placeholderDisplay = useMemo(() => (
    <StyleGridContainer>
      <PlaceholderGrid cropAspectRatio={cropAspectRatio} />
    </StyleGridContainer>
  ), [cropAspectRatio]);

  // Show skeleton loading on initial load
  if (isInitialLoading) {
    return loadingDisplay;
  }

  // Show placeholder thumbnails when no photo is uploaded
  if (!croppedImage) {
    return placeholderDisplay;
  }

  // Show optimized style cards when photo is uploaded
  return (
    <StyleGridContainer>
      <OptimizedActiveStyleGrid
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
