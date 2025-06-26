
import { useState, useEffect } from 'react';

interface UseBlinkingOptions {
  isGenerating?: boolean;
  hasPreview?: boolean;
}

export const useBlinking = (previewUrl: string | null, options: UseBlinkingOptions = {}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // STEP 1: Verify hook updates are immediate - log inside the hook
  useEffect(() => {
    console.log('🔔 useBlinking - Hook sees state change:', {
      previewUrl: previewUrl ? 'EXISTS' : 'NULL',
      previewUrlValue: previewUrl ? previewUrl.substring(0, 50) + '...' : 'null',
      currentBlinkingState: isBlinking,
      timestamp: new Date().toISOString()
    });
  }, [previewUrl, isBlinking]);

  // STEP 2 & 3: Single source of truth with proper cleanup
  useEffect(() => {
    console.log('🎯 useBlinking - Effect triggered:', {
      previewUrl: previewUrl ? 'EXISTS' : 'NULL',
      shouldStartBlinking: !previewUrl
    });

    if (!previewUrl) {
      // Start blinking - use setInterval for controlled animation
      console.log('🚀 Starting blink animation');
      setIsBlinking(true);
      
      const blinkInterval = setInterval(() => {
        setIsBlinking(prev => {
          const newState = !prev;
          console.log('🔄 Blink toggle:', { from: prev, to: newState });
          return newState;
        });
      }, 500);

      // Cleanup function
      return () => {
        console.log('🧹 Clearing blink interval');
        clearInterval(blinkInterval);
      };
    } else {
      // Preview is ready - STOP BLINKING IMMEDIATELY
      console.log('🛑 Preview ready - STOPPING blink animation');
      setIsBlinking(false);
    }
  }, [previewUrl]); // Only previewUrl in dependency array

  // STEP 1: Additional verification - force stop when preview becomes available
  useEffect(() => {
    if (previewUrl && isBlinking) {
      console.log('🚨 FORCE STOP - Preview exists but still blinking, forcing stop');
      setIsBlinking(false);
    }
  }, [previewUrl, isBlinking]);

  console.log('🔔 useBlinking returning:', { isBlinking, hasPreview: !!previewUrl });
  
  return { isBlinking };
};
