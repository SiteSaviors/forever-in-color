
import { useState, useEffect, useMemo } from 'react';

interface UseBlinkingOptions {
  isGenerating?: boolean;
  hasPreview?: boolean;
  hasGeneratedOnce?: boolean;
}

export const useBlinking = (previewUrl: string | null, options: UseBlinkingOptions = {}) => {
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  const { isGenerating = false } = options;

  // Track if we've ever generated a preview - this should persist permanently
  useEffect(() => {
    if (previewUrl && !hasGeneratedOnce) {
      console.log('🎯 Style has been generated for the first time, marking as permanently generated');
      setHasGeneratedOnce(true);
    }
  }, [previewUrl, hasGeneratedOnce]);

  // Memoize the return value to prevent unnecessary re-renders
  const blinkingState = useMemo(() => {
    console.log('🔔 useBlinking returning:', { 
      isBlinking: false, // Always false - no more blinking for performance
      hasPreview: !!previewUrl, 
      isGenerating,
      hasGeneratedOnce
    });
    
    return { 
      isBlinking: false, // Disabled for performance
      hasGeneratedOnce
    };
  }, [previewUrl, isGenerating, hasGeneratedOnce]);

  return blinkingState;
};
