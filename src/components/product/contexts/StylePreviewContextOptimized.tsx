
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useStylePreviewLogic } from './useStylePreviewLogic';
import { useDebouncedApiRequest } from '../hooks/useDebounce';
import { generateStylePreview } from '@/utils/stylePreviewApi';

interface StylePreviewContextType {
  generatePreview: (styleId: number, styleName: string) => Promise<void>;
  getPreviewUrl: (styleId: number) => string | undefined;
  isLoading: (styleId: number) => boolean;
  hasPreview: (styleId: number) => boolean;
  hasError: (styleId: number) => boolean;
  getError: (styleId: number) => string | undefined;
  clearPreview: (styleId: number) => void;
  clearAllPreviews: () => void;
}

const StylePreviewContext = createContext<StylePreviewContextType | undefined>(undefined);

interface StylePreviewProviderProps {
  children: React.ReactNode;
  croppedImage: string | null;
  selectedOrientation: string;
}

export const StylePreviewProvider = React.memo(({ 
  children, 
  croppedImage, 
  selectedOrientation 
}: StylePreviewProviderProps) => {
  const {
    previews,
    loadingStates,
    errors,
    setLoading,
    setPreview,
    setError,
    clearPreview,
    clearAllPreviews
  } = useStylePreviewLogic();

  // Debounced API call for preview generation
  const { debouncedRequest: debouncedGeneratePreview } = useDebouncedApiRequest(
    async (styleId: number, styleName: string, image: string, orientation: string) => {
      console.log(`🎨 Generating preview for style ${styleId} (${styleName})`);
      
      setLoading(styleId, true);
      setError(styleId, null);

      try {
        const result = await generateStylePreview(image, styleName, orientation);
        
        if (result.success && result.imageUrl) {
          setPreview(styleId, result.imageUrl);
          console.log(`✅ Preview generated for style ${styleId}`);
        } else {
          throw new Error(result.error || 'Failed to generate preview');
        }
      } catch (error) {
        console.error(`❌ Error generating preview for style ${styleId}:`, error);
        setError(styleId, error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(styleId, false);
      }
    },
    250 // 250ms debounce delay
  );

  const generatePreview = useCallback(async (styleId: number, styleName: string) => {
    if (!croppedImage) {
      console.warn('No cropped image available for preview generation');
      return;
    }

    await debouncedGeneratePreview(styleId, styleName, croppedImage, selectedOrientation);
  }, [croppedImage, selectedOrientation, debouncedGeneratePreview]);

  const getPreviewUrl = useCallback((styleId: number) => {
    return previews[styleId]?.url;
  }, [previews]);

  const isLoading = useCallback((styleId: number) => {
    return loadingStates[styleId] || false;
  }, [loadingStates]);

  const hasPreview = useCallback((styleId: number) => {
    return !!previews[styleId]?.url;
  }, [previews]);

  const hasError = useCallback((styleId: number) => {
    return !!errors[styleId];
  }, [errors]);

  const getError = useCallback((styleId: number) => {
    return errors[styleId];
  }, [errors]);

  const contextValue = useMemo(() => ({
    generatePreview,
    getPreviewUrl,
    isLoading,
    hasPreview,
    hasError,
    getError,
    clearPreview,
    clearAllPreviews
  }), [
    generatePreview,
    getPreviewUrl,
    isLoading,
    hasPreview,
    hasError,
    getError,
    clearPreview,
    clearAllPreviews
  ]);

  return (
    <StylePreviewContext.Provider value={contextValue}>
      {children}
    </StylePreviewContext.Provider>
  );
});

StylePreviewProvider.displayName = 'StylePreviewProvider';

export const useStylePreview = () => {
  const context = useContext(StylePreviewContext);
  if (context === undefined) {
    throw new Error('useStylePreview must be used within a StylePreviewProvider');
  }
  return context;
};
