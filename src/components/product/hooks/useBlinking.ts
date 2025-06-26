
import { useState, useEffect } from 'react';

interface UseBlinkingOptions {
  isGenerating?: boolean;
  hasPreview?: boolean;
}

export const useBlinking = (previewUrl: string | null, options: UseBlinkingOptions = {}) => {
  const { isGenerating, hasPreview } = options;
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    // Primary signal: use previewUrl as the main indicator
    const shouldBlink = !previewUrl && (isGenerating !== false);
    
    console.log('🔔 useBlinking state:', {
      previewUrl: previewUrl ? 'exists' : 'null',
      isGenerating,
      hasPreview,
      shouldBlink,
      currentlyBlinking: isBlinking
    });

    if (shouldBlink && !isBlinking) {
      console.log('🟢 Starting blink animation');
      setIsBlinking(true);
    } else if (!shouldBlink && isBlinking) {
      console.log('🔴 Stopping blink animation');
      setIsBlinking(false);
    }
  }, [previewUrl, isGenerating, hasPreview, isBlinking]);

  // Force stop blinking when preview is ready
  useEffect(() => {
    if (previewUrl && isBlinking) {
      console.log('🛑 Force stopping blink - preview is ready');
      setIsBlinking(false);
    }
  }, [previewUrl, isBlinking]);

  return { isBlinking };
};
