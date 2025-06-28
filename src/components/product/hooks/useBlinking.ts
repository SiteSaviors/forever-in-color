
import { useState, useEffect } from 'react';

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

  console.log('🔔 useBlinking returning:', { 
    isBlinking: false, // Always false - no more blinking
    hasPreview: !!previewUrl, 
    isGenerating,
    hasGeneratedOnce
  });
  
  // Never return true for blinking - animation removed
  return { 
    isBlinking: false,
    hasGeneratedOnce
  };
};
