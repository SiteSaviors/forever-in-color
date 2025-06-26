
import React from 'react';

interface AnimationDiagnosticProps {
  isGenerating: boolean;
  previewUrl: string | null;
  isBlinking: boolean;
  componentName: string;
}

export const AnimationDiagnostic = ({ 
  isGenerating, 
  previewUrl, 
  isBlinking, 
  componentName 
}: AnimationDiagnosticProps) => {
  const timestamp = new Date().toISOString();
  
  React.useEffect(() => {
    console.log(`🔍 ${componentName} Animation State:`, {
      isGenerating,
      hasPreview: !!previewUrl,
      previewUrl: previewUrl ? previewUrl.substring(0, 50) + '...' : 'null',
      isBlinking,
      shouldStop: !!previewUrl,
      timestamp
    });
  }, [isGenerating, previewUrl, isBlinking, componentName, timestamp]);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 bg-black text-white text-xs p-2 z-50 max-w-xs">
      <div className="font-bold">{componentName} Debug:</div>
      <div>Generating: {isGenerating ? '✅' : '❌'}</div>
      <div>Preview: {previewUrl ? '✅' : '❌'}</div>
      <div>Blinking: {isBlinking ? '🔄' : '⏹️'}</div>
      <div>Should Stop: {previewUrl ? '✅ YES' : '❌ NO'}</div>
    </div>
  );
};

export default AnimationDiagnostic;
