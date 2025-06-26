
import { useState, useEffect } from 'react';

interface UseBlinkingOptions {
  isGenerating?: boolean;
  hasPreview?: boolean;
}

export const useBlinking = (previewUrl: string | null, options: UseBlinkingOptions = {}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Only start blinking if we're actually generating something
  const { isGenerating = false } = options;

  // CRITICAL FIX: Immediate stop when preview becomes available
  useEffect(() => {
    if (previewUrl) {
      console.log('🚨 IMMEDIATE STOP - Preview detected, forcing stop:', {
        previewUrl: previewUrl.substring(0, 50) + '...',
        wasBlinking: isBlinking,
        timestamp: new Date().toISOString()
      });
      setIsBlinking(false);
      return; // Exit early
    }
  }, [previewUrl]); // Run this first and separately

  // STEP 1: Verify hook updates are immediate - log inside the hook
  useEffect(() => {
    console.log('🔔 useBlinking - Hook sees state change:', {
      previewUrl: previewUrl ? 'EXISTS' : 'NULL',
      previewUrlValue: previewUrl ? previewUrl.substring(0, 50) + '...' : 'null',
      currentBlinkingState: isBlinking,
      isGenerating,
      timestamp: new Date().toISOString()
    });
  }, [previewUrl, isBlinking, isGenerating]);

  // STEP 2 & 3: Single source of truth with proper cleanup
  useEffect(() => {
    console.log('🎯 useBlinking - Effect triggered:', {
      previewUrl: previewUrl ? 'EXISTS' : 'NULL',
      isGenerating,
      shouldStartBlinking: !previewUrl && isGenerating
    });

    // Only start blinking if we don't have a preview AND we're actively generating
    if (!previewUrl && isGenerating) {
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
      // Preview is ready OR we're not generating - STOP BLINKING IMMEDIATELY
      console.log('🛑 Preview ready or not generating - STOPPING blink animation');
      setIsBlinking(false);
    }
  }, [previewUrl, isGenerating]); // Include isGenerating in dependency array

  // ENHANCED: Double-check to force stop when preview becomes available
  useEffect(() => {
    if (previewUrl && isBlinking) {
      console.log('🚨 DOUBLE-CHECK FORCE STOP - Preview exists but still blinking, forcing stop');
      setIsBlinking(false);
    }
  }, [previewUrl, isBlinking]);

  console.log('🔔 useBlinking returning:', { isBlinking, hasPreview: !!previewUrl, isGenerating });
  
  return { isBlinking };
};
