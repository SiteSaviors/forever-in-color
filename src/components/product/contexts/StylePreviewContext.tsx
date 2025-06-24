
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
    hasError,
    getPreviewUrl,
    getError
  } = useStylePreviewHelpers(previews);

  // Retry generation function
  const retryGeneration = async (styleId: number, styleName: string) => {
    dispatch({ type: 'RETRY_GENERATION', styleId });
    await generatePreview(styleId, styleName);
  };

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
