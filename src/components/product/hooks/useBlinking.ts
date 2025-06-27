
import { useState, useEffect } from 'react';

interface UseBlinkingOptions {
  isGenerating?: boolean;
  hasPreview?: boolean;
  hasGeneratedOnce?: boolean;
}

export const useBlinking = (previewUrl: string | null, options: UseBlinkingOptions = {}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  const { isGenerating = false } = options;

  // Track if we've ever generated a preview - this should persist permanently
  useEffect(() => {
    if (previewUrl && !hasGeneratedOnce) {
      console.log('🎯 Style has been generated for the first time, marking as permanently generated');
      setHasGeneratedOnce(true);
      setIsBlinking(false); // Immediately stop blinking when preview is available
    }
  }, [previewUrl, hasGeneratedOnce]);

  // CRITICAL FIX: Never allow blinking if we've generated once OR if we have a preview
  useEffect(() => {
    if (hasGeneratedOnce || previewUrl) {
      console.log('🛑 Style has been generated before or has preview, permanently stopping blinking');
      setIsBlinking(false);
      return;
    }

    // Only start blinking if we don't have a preview AND we're actively generating AND we haven't generated before
    if (!previewUrl && isGenerating && !hasGeneratedOnce) {
      console.log('🚀 Starting blink animation for generation');
      setIsBlinking(true);
      
      const blinkInterval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 500);

      return () => {
        console.log('🧹 Clearing blink interval');
        clearInterval(blinkInterval);
      };
    } else {
      // Stop blinking in all other cases
      setIsBlinking(false);
    }
  }, [previewUrl, isGenerating, hasGeneratedOnce]);

  console.log('🔔 useBlinking returning:', { 
    isBlinking: hasGeneratedOnce || previewUrl ? false : isBlinking, 
    hasPreview: !!previewUrl, 
    isGenerating,
    hasGeneratedOnce
  });
  
  // NEVER return true for blinking if we have a preview OR if we've generated once before
  return { 
    isBlinking: (hasGeneratedOnce || previewUrl) ? false : isBlinking,
    hasGeneratedOnce
  };
};
