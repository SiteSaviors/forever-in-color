
import { useState, useCallback } from 'react';

interface StylePreview {
  url: string;
  timestamp: number;
}

interface StylePreviewState {
  previews: { [key: number]: StylePreview };
  loadingStates: { [key: number]: boolean };
  errors: { [key: number]: string };
}

export const useStylePreviewLogic = () => {
  const [previews, setPreviews] = useState<{ [key: number]: StylePreview }>({});
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const setLoading = useCallback((styleId: number, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [styleId]: loading
    }));
  }, []);

  const setPreview = useCallback((styleId: number, url: string) => {
    setPreviews(prev => ({
      ...prev,
      [styleId]: {
        url,
        timestamp: Date.now()
      }
    }));
  }, []);

  const setError = useCallback((styleId: number, error: string | null) => {
    if (error) {
      setErrors(prev => ({
        ...prev,
        [styleId]: error
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[styleId];
        return newErrors;
      });
    }
  }, []);

  const clearPreview = useCallback((styleId: number) => {
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[styleId];
      return newPreviews;
    });
    setLoadingStates(prev => {
      const newLoading = { ...prev };
      delete newLoading[styleId];
      return newLoading;
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[styleId];
      return newErrors;
    });
  }, []);

  const clearAllPreviews = useCallback(() => {
    setPreviews({});
    setLoadingStates({});
    setErrors({});
  }, []);

  return {
    previews,
    loadingStates,
    errors,
    setLoading,
    setPreview,
    setError,
    clearPreview,
    clearAllPreviews
  };
};
