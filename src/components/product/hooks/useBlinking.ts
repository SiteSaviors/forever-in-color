
import { useState, useEffect } from 'react';

interface UseBlinkingOptions {
  isGenerating?: boolean;
  hasPreview?: boolean;
}

export const useBlinking = (previewUrl: string | null, options: UseBlinkingOptions = {}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  const { isGenerating = false } = options;

  // CRITICAL FIX: Immediate stop when preview becomes available - highest priority
  useEffect(() => {
    if (previewUrl) {
      console.log('🚨 IMMEDIATE STOP - Preview detected, forcing stop:', {
        previewUrl: previewUrl.substring(0, 50) + '...',
        wasBlinking: isBlinking,
        timestamp: new Date().toISOString()
      });
      setIsBlinking(false);
      return;
    }
  }, [previewUrl]);

  // Main blinking logic with cleanup
  useEffect(() => {
    let blinkInterval: NodeJS.Timeout | null = null;

    // Only start blinking if we don't have a preview AND we're actively generating
    if (!previewUrl && isGenerating) {
      console.log('🚀 Starting blink animation for generation');
      setIsBlinking(true);
      
      blinkInterval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 500);
    } else {
      // Preview is ready OR we're not generating - STOP BLINKING IMMEDIATELY
      console.log('🛑 Stopping blink animation - preview ready or not generating');
      setIsBlinking(false);
    }

    // Cleanup function
    return () => {
      if (blinkInterval) {
        console.log('🧹 Clearing blink interval');
        clearInterval(blinkInterval);
      }
    };
  }, [previewUrl, isGenerating]);

  // Additional safety check - force stop if preview exists but still blinking
  useEffect(() => {
    if (previewUrl && isBlinking) {
      console.log('🚨 SAFETY CHECK - Preview exists but still blinking, forcing stop');
      setIsBlinking(false);
    }
  }, [previewUrl, isBlinking]);

  console.log('🔔 useBlinking returning:', { 
    isBlinking: !previewUrl ? isBlinking : false, // Force false if preview exists
    hasPreview: !!previewUrl, 
    isGenerating 
  });
  
  // Always return false if we have a preview, regardless of internal state
  return { isBlinking: !previewUrl ? isBlinking : false };
};
