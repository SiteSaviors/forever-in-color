
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
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
import { generateStylePreview } from '@/utils/stylePreviewApi';

const StylePreviewContext = createContext<StylePreviewContextType | null>(null);

export const StylePreviewProvider = ({ 
  children, 
  croppedImage, 
  selectedOrientation 
}: StylePreviewProviderProps) => {
  const [previews, dispatch] = useReducer(stylePreviewReducer, initialState);
  const { user } = useAuthStore();

  // Get state management functions from the logic hook
  const {
    setLoading,
    setPreview,
    setError,
    clearPreview,
    clearAllPreviews
  } = useStylePreviewLogic();

  const {
    getPreviewStatus,
    isLoading,
    hasPreview,
    hasError,
    getPreviewUrl,
    getError
  } = useStylePreviewHelpers(previews);

  // Implement the generatePreview function that was missing
  const generatePreview = useCallback(async (styleId: number, styleName: string) => {
    if (!croppedImage) {
      console.warn('No cropped image available for preview generation');
      return;
    }

    console.log(`🎨 Generating preview for style ${styleId} (${styleName})`);
    
    dispatch({ type: 'SET_LOADING', styleId, loading: true });
    dispatch({ type: 'CLEAR_ERROR', styleId });

    try {
      const result = await generateStylePreview(croppedImage, styleName, selectedOrientation);
      
      if (result.success && result.imageUrl) {
        dispatch({ type: 'SET_PREVIEW', styleId, url: result.imageUrl });
        console.log(`✅ Preview generated for style ${styleId}`);
      } else {
        throw new Error(result.error || 'Failed to generate preview');
      }
    } catch (error) {
      console.error(`❌ Error generating preview for style ${styleId}:`, error);
      dispatch({ 
        type: 'SET_ERROR', 
        styleId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', styleId, loading: false });
    }
  }, [croppedImage, selectedOrientation]);

  // Retry generation function
  const retryGeneration = useCallback(async (styleId: number, styleName: string) => {
    dispatch({ type: 'RETRY_GENERATION', styleId });
    await generatePreview(styleId, styleName);
  }, [generatePreview]);

  // Reset previews when cropped image changes
  useEffect(() => {
    if (!croppedImage) {
      dispatch({ type: 'RESET_ALL' });
    }
  }, [croppedImage]);

  const contextValue: StylePreviewContextType = {
    previews,
    croppedImage,
    selectedOrientation,
    generatePreview,
    retryGeneration,
    getPreviewStatus,
    isLoading,
    hasPreview,
    hasError,
    getPreviewUrl,
    getError
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
