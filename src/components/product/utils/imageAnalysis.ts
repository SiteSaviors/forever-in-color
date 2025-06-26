
import { photoAnalysisEngine } from "@/utils/photoAnalysisEngine";

export interface ImageAnalysis {
  orientation: string;
  hasPortrait: boolean;
  isLandscape: boolean;
  hasHighContrast: boolean;
  dominantColors: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

// Enhanced image analysis using our new photo analysis engine
export const analyzeImageForRecommendations = async (imageUrl: string): Promise<ImageAnalysis> => {
  try {
    console.log('🔍 Using enhanced photo analysis engine...');
    const result = await photoAnalysisEngine.analyzePhoto(imageUrl);
    
    return {
      orientation: result.orientation,
      hasPortrait: result.hasPortrait,
      isLandscape: result.isLandscape,
      hasHighContrast: result.contrast === 'high',
      dominantColors: result.dominantColors.slice(0, 3),
      complexity: result.complexity
    };
  } catch (error) {
    console.warn('Enhanced analysis failed, falling back to basic analysis:', error);
    return fallbackAnalysis(imageUrl);
  }
};

// Fallback to original analysis method
const fallbackAnalysis = async (imageUrl: string): Promise<ImageAnalysis> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(getDefaultAnalysis());
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const aspectRatio = img.width / img.height;
      const isLandscape = aspectRatio > 1.2;
      const isPortrait = aspectRatio < 0.8;

      try {
        const imageData = ctx.getImageData(0, 0, Math.min(100, img.width), Math.min(100, img.height));
        const pixels = imageData.data;
        let totalBrightness = 0;
        let brightPixels = 0;
        let darkPixels = 0;

        for (let i = 0; i < pixels.length; i += 16) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const brightness = (r + g + b) / 3;
          
          totalBrightness += brightness;
          if (brightness > 180) brightPixels++;
          if (brightness < 75) darkPixels++;
        }

        const sampledPixels = pixels.length / 16;
        const avgBrightness = totalBrightness / sampledPixels;
        const hasHighContrast = (brightPixels + darkPixels) / sampledPixels > 0.4;

        resolve({
          orientation: isPortrait ? 'vertical' : isLandscape ? 'horizontal' : 'square',
          hasPortrait: isPortrait,
          isLandscape: isLandscape,
          hasHighContrast,
          dominantColors: avgBrightness > 128 ? ['light'] : ['dark'],
          complexity: hasHighContrast ? 'complex' : 'simple'
        });
      } catch (error) {
        resolve(getDefaultAnalysis());
      }
    };

    img.onerror = () => resolve(getDefaultAnalysis());
    img.src = imageUrl;
  });
};

const getDefaultAnalysis = (): ImageAnalysis => ({
  orientation: 'square',
  hasPortrait: false,
  isLandscape: false,
  hasHighContrast: false,
  dominantColors: ['neutral'],
  complexity: 'moderate'
});
