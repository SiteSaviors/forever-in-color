
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

  // Track if we've ever generated a preview - this should persist
  useEffect(() => {
    if (previewUrl && !hasGeneratedOnce) {
      console.log('🎯 Style has been generated for the first time, marking as generated');
      setHasGeneratedOnce(true);
    }
  }, [previewUrl, hasGeneratedOnce]);

  // CRITICAL FIX: Never blink again if we've generated once
  useEffect(() => {
    if (hasGeneratedOnce) {
      console.log('🛑 Style has been generated before, permanently stopping blinking');
      setIsBlinking(false);
      return;
    }

    if (previewUrl) {
      console.log('🚨 IMMEDIATE STOP - Preview detected, forcing stop:', {
        previewUrl: previewUrl.substring(0, 50) + '...',
        wasBlinking: isBlinking,
        timestamp: new Date().toISOString()
      });
      setIsBlinking(false);
      return;
    }
  }, [previewUrl, hasGeneratedOnce]);

  // Main blinking logic with cleanup
  useEffect(() => {
    let blinkInterval: NodeJS.Timeout | null = null;

    // Only start blinking if we don't have a preview AND we're actively generating AND we haven't generated before
    if (!previewUrl && isGenerating && !hasGeneratedOnce) {
      console.log('🚀 Starting blink animation for generation');
      setIsBlinking(true);
      
      blinkInterval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 500);
    } else {
      // Preview is ready OR we're not generating OR we've generated before - STOP BLINKING IMMEDIATELY
      console.log('🛑 Stopping blink animation - preview ready, not generating, or already generated before');
      setIsBlinking(false);
    }

    // Cleanup function
    return () => {
      if (blinkInterval) {
        console.log('🧹 Clearing blink interval');
        clearInterval(blinkInterval);
      }
    };
  }, [previewUrl, isGenerating, hasGeneratedOnce]);

  console.log('🔔 useBlinking returning:', { 
    isBlinking: !previewUrl && !hasGeneratedOnce ? isBlinking : false, 
    hasPreview: !!previewUrl, 
    isGenerating,
    hasGeneratedOnce
  });
  
  // Always return false if we have a preview OR if we've generated once before
  return { 
    isBlinking: !previewUrl && !hasGeneratedOnce ? isBlinking : false,
    hasGeneratedOnce
  };
};
