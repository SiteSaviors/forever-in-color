import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';
import { useAuthStore } from '@/hooks/useAuthStore';

interface PreviewState {
  status: 'idle' | 'loading' | 'success' | 'error';
  url?: string;
  error?: string;
}

interface StylePreviewState {
  [styleId: number]: PreviewState;
}

type StylePreviewAction =
  | { type: 'START_GENERATION'; styleId: number }
  | { type: 'GENERATION_SUCCESS'; styleId: number; url: string }
  | { type: 'GENERATION_ERROR'; styleId: number; error: string }
  | { type: 'RESET_ALL' };

const initialState: StylePreviewState = {};

function stylePreviewReducer(state: StylePreviewState, action: StylePreviewAction): StylePreviewState {
  switch (action.type) {
    case 'START_GENERATION':
      return {
        ...state,
        [action.styleId]: { status: 'loading' }
      };
    case 'GENERATION_SUCCESS':
      return {
        ...state,
        [action.styleId]: { status: 'success', url: action.url }
      };
    case 'GENERATION_ERROR':
      return {
        ...state,
        [action.styleId]: { status: 'error', error: action.error }
      };
    case 'RESET_ALL':
      return initialState;
    default:
      return state;
  }
}

interface StylePreviewContextType {
  previews: StylePreviewState;
  generatePreview: (styleId: number, styleName: string) => Promise<void>;
  getPreviewStatus: (styleId: number) => PreviewState;
  isLoading: (styleId: number) => boolean;
  hasPreview: (styleId: number) => boolean;
  getPreviewUrl: (styleId: number) => string | undefined;
}

const StylePreviewContext = createContext<StylePreviewContextType | null>(null);

interface StylePreviewProviderProps {
  children: React.ReactNode;
  croppedImage: string | null;
  selectedOrientation: string;
}

export const StylePreviewProvider = ({ 
  children, 
  croppedImage, 
  selectedOrientation 
}: StylePreviewProviderProps) => {
  const [previews, dispatch] = useReducer(stylePreviewReducer, initialState);
  const { user } = useAuthStore();

  // Convert orientation to aspect ratio for API
  const getAspectRatio = useCallback((orientation: string) => {
    switch (orientation) {
      case 'vertical':
        return '2:3';
      case 'horizontal':
        return '3:2';
      case 'square':
      default:
        return '1:1';
    }
  }, []);

  // Auto-generate previews for popular styles when cropped image is available
  useEffect(() => {
    if (!croppedImage) {
      dispatch({ type: 'RESET_ALL' });
      return;
    }

    // TEMPORARY: Skip auto-generation if user is signed in to save on API costs during testing
    if (user) {
      console.log('🚫 Skipping auto-generation - user is signed in (testing mode)');
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

  // Manual generation function
  const generatePreview = useCallback(async (styleId: number, styleName: string) => {
    if (!croppedImage) {
      console.error('❌ Cannot generate preview: no cropped image');
      return;
    }

    if (styleId === 1) {
      console.log('⏭️ Skipping generation for Original Image style');
      return;
    }

    try {
      console.log(`🎨 Starting manual generation for ${styleName} (ID: ${styleId})`);
      dispatch({ type: 'START_GENERATION', styleId });
      
      const aspectRatio = getAspectRatio(selectedOrientation);
      const tempPhotoId = `temp_${Date.now()}_${styleId}`;
      
      console.log(`📋 Generation parameters:`, {
        styleName,
        styleId,
        aspectRatio,
        selectedOrientation
      });
      
      const previewUrl = await generateStylePreview(
        croppedImage, 
        styleName, 
        tempPhotoId, 
        aspectRatio
      );

      if (previewUrl) {
        try {
          const watermarkedUrl = await addWatermarkToImage(previewUrl);
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: watermarkedUrl 
          });
          console.log(`✅ Manual generation completed for ${styleName}`);
        } catch (watermarkError) {
          console.warn(`⚠️ Watermark failed for ${styleName}, using original:`, watermarkError);
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: previewUrl 
          });
        }
      }
    } catch (error) {
      console.error(`❌ Manual generation failed for ${styleName}:`, error);
      dispatch({ 
        type: 'GENERATION_ERROR', 
        styleId, 
        error: error.message 
      });
    }
  }, [croppedImage, selectedOrientation, getAspectRatio]);

  // Helper functions
  const getPreviewStatus = useCallback((styleId: number): PreviewState => {
    return previews[styleId] || { status: 'idle' };
  }, [previews]);

  const isLoading = useCallback((styleId: number): boolean => {
    return previews[styleId]?.status === 'loading';
  }, [previews]);

  const hasPreview = useCallback((styleId: number): boolean => {
    return previews[styleId]?.status === 'success' && !!previews[styleId]?.url;
  }, [previews]);

  const getPreviewUrl = useCallback((styleId: number): string | undefined => {
    return previews[styleId]?.url;
  }, [previews]);

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
