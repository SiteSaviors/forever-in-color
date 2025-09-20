import { useCallback } from 'react';
import { StylePreviewState, PreviewState } from './types';

export const useStylePreviewHelpers = (previews: StylePreviewState) => {
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

  const hasError = useCallback((styleId: number): boolean => {
    return previews[styleId]?.status === 'error';
  }, [previews]);

  const getPreviewUrl = useCallback((styleId: number): string | undefined => {
    return previews[styleId]?.url;
  }, [previews]);

  const getError = useCallback((styleId: number): string | undefined => {
    return previews[styleId]?.error;
  }, [previews]);

  return {
    getPreviewStatus,
    isLoading,
    hasPreview,
    hasError,
    getPreviewUrl,
    getError
  };
};