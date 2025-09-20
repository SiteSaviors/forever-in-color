
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useApiErrorHandler = () => {
  const handleApiError = useCallback((error: unknown, context?: string) => {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    
    // Show user-friendly error message
    toast.error(`${context ? `${context}: ` : ''}${errorMessage}`, {
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    });
    
    return errorMessage;
  }, []);

  const handleNetworkError = useCallback((response: Response, context?: string) => {
    const errorMessage = `Network error: ${response.status} ${response.statusText}`;
    console.error(`Network Error${context ? ` in ${context}` : ''}:`, errorMessage);
    
    toast.error(`${context ? `${context}: ` : ''}Failed to load data`, {
      description: 'Please check your internet connection and try again.',
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    });
    
    return errorMessage;
  }, []);

  return {
    handleApiError,
    handleNetworkError
  };
};
