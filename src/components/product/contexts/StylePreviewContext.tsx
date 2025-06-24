
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { 
  StylePreviewContextType, 
  StylePreviewProviderProps 
} from './types';
import { 
  stylePreviewReducer, 
  initialState 
} from './stylePreviewReducer';
import { useStylePreviewLogic } from './useStylePreviewLogic';
import { useStylePreviewHelpers } from './stylePreviewHelpers';

const StylePreviewContext = createContext<StylePreviewContextType | null>(null);

export const StylePreviewProvider = ({ 
  children, 
  croppedImage, 
  selectedOrientation 
}: StylePreviewProviderProps) => {
  const [previews, dispatch] = useReducer(stylePreviewReducer, initialState);
  const { user } = useAuthStore();

  // Custom hooks for logic separation
  const { generatePreview } = useStylePreviewLogic({
    croppedImage,
    selectedOrientation,
    dispatch
  });

  const {
    getPreviewStatus,
    isLoading,
    hasPreview,
    getPreviewUrl
  } = useStylePreviewHelpers(previews);

  // TEMPORARILY DISABLED: Auto-generate previews for popular styles when cropped image is available
  /*
  useEffect(() => {
    if (!croppedImage) {
      dispatch({ type: 'RESET_ALL' });
      return;
    }

    const popularStyles = [
      { id: 2, name: "Classic Oil Painting" },
      { id: 4, name: "Watercolor Dreams" },
      { id: 5, name: "Pastel Bliss" }
    ];

    const autoGeneratePreviews = async () => {
      console.log('🚀 Auto-generating previews for popular styles IN PARALLEL with orientation:', selectedOrientation);
      
      // Start all generations simultaneously - no await in the loop
      const generationPromises = popularStyles.map(async (style) => {
        try {
          dispatch({ type: 'START_GENERATION', styleId: style.id });
          console.log(`Starting parallel generation for ${style.name} (ID: ${style.id})`);
          
          const aspectRatio = getAspectRatio(selectedOrientation);
          const tempPhotoId = `temp_${Date.now()}_${style.id}`;
          
          const previewUrl = await generateStylePreview(
            croppedImage, 
            style.name, 
            tempPhotoId, 
            aspectRatio
          );

          if (previewUrl) {
            try {
              const watermarkedUrl = await addWatermarkToImage(previewUrl);
              dispatch({ 
                type: 'GENERATION_SUCCESS', 
                styleId: style.id, 
                url: watermarkedUrl 
              });
              console.log(`✅ Parallel generation completed for ${style.name}`);
            } catch (watermarkError) {
              console.warn(`⚠️ Watermark failed for ${style.name}, using original:`, watermarkError);
              dispatch({ 
                type: 'GENERATION_SUCCESS', 
                styleId: style.id, 
                url: previewUrl 
              });
            }
          }
        } catch (error) {
          console.error(`❌ Parallel generation failed for ${style.name}:`, error);
          dispatch({ 
            type: 'GENERATION_ERROR', 
            styleId: style.id, 
            error: error.message 
          });
        }
      });

      // Wait for all generations to complete (or fail)
      await Promise.allSettled(generationPromises);
      console.log('🎉 All parallel generations completed');
    };

    autoGeneratePreviews();
  }, [croppedImage, selectedOrientation, getAspectRatio, user]);
  */

  // Reset previews when cropped image changes
  useEffect(() => {
    if (!croppedImage) {
      dispatch({ type: 'RESET_ALL' });
    }
  }, [croppedImage]);

  const contextValue: StylePreviewContextType = {
    previews,
    generatePreview,
    getPreviewStatus,
    isLoading,
    hasPreview,
    getPreviewUrl
  };

  return (
    <StylePreviewContext.Provider value={contextValue}>
      {children}
    </StylePreviewContext.Provider>
  );
};

export const useStylePreview = (): StylePreviewContextType => {
  const context = useContext(StylePreviewContext);
  if (!context) {
    throw new Error('useStylePreview must be used within a StylePreviewProvider');
  }
  return context;
};
