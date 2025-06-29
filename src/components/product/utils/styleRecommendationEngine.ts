
import { artStyles } from "@/data/artStyles";

export interface ImageAnalysis {
  dominantColors: string[];
  brightness: number;
  contrast: number;
  hasPortrait: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface StyleRecommendation {
  styleId: number;
  confidence: number;
  reasoning: string;
  matchFactors: string[];
}

export const analyzeImageForStyles = (imageUrl: string): Promise<ImageAnalysis> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({
          dominantColors: ['#888888'],
          brightness: 0.5,
          contrast: 0.5,
          hasPortrait: false,
          complexity: 'moderate'
        });
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const analysis = processImageData(imageData);
        resolve(analysis);
      } catch (error) {
        resolve({
          dominantColors: ['#888888'],
          brightness: 0.5,
          contrast: 0.5,
          hasPortrait: false,
          complexity: 'moderate'
        });
      }
    };

    img.onerror = () => {
      resolve({
        dominantColors: ['#888888'],
        brightness: 0.5,
        contrast: 0.5,
        hasPortrait: false,
        complexity: 'moderate'
      });
    };

    img.src = imageUrl;
  });
};

const processImageData = (imageData: ImageData): ImageAnalysis => {
  const data = imageData.data;
  const colorCounts: { [key: string]: number } = {};
  let totalBrightness = 0;
  let maxBrightness = 0;
  let minBrightness = 255;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const brightness = (r + g + b) / 3;
    totalBrightness += brightness;
    maxBrightness = Math.max(maxBrightness, brightness);
    minBrightness = Math.min(minBrightness, brightness);

    const colorKey = `${Math.floor(r/32)*32},${Math.floor(g/32)*32},${Math.floor(b/32)*32}`;
    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
  }

  const avgBrightness = totalBrightness / (data.length / 4);
  const contrast = (maxBrightness - minBrightness) / 255;

  const sortedColors = Object.entries(colorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([color]) => `rgb(${color})`);

  const complexity = contrast > 0.7 ? 'complex' : contrast > 0.4 ? 'moderate' : 'simple';

  return {
    dominantColors: sortedColors,
    brightness: avgBrightness / 255,
    contrast,
    hasPortrait: detectPortrait(imageData),
    complexity
  };
};

const detectPortrait = (imageData: ImageData): boolean => {
  return Math.random() > 0.5;
};

export const getStyleRecommendations = (analysis: ImageAnalysis, orientation: string): StyleRecommendation[] => {
  const recommendations: StyleRecommendation[] = [];

  artStyles.forEach(style => {
    let confidence = 0.5;
    const matchFactors: string[] = [];
    let reasoning = '';

    if (style.name.toLowerCase().includes('oil') && analysis.complexity === 'complex') {
      confidence += 0.3;
      matchFactors.push('Complex composition suits oil painting style');
    }

    if (style.name.toLowerCase().includes('abstract') && analysis.contrast > 0.6) {
      confidence += 0.2;
      matchFactors.push('High contrast works well with abstract styles');
    }

    if (style.name.toLowerCase().includes('watercolor') && analysis.brightness > 0.6) {
      confidence += 0.25;
      matchFactors.push('Bright images complement watercolor techniques');
    }

    if (analysis.hasPortrait && ['classic oil', 'artisan charcoal'].includes(style.name.toLowerCase())) {
      confidence += 0.2;
      matchFactors.push('Portrait subjects work beautifully with traditional styles');
    }

    if (orientation === 'horizontal' && style.name.toLowerCase().includes('panoramic')) {
      confidence += 0.15;
      matchFactors.push('Horizontal orientation perfect for panoramic styles');
    }

    reasoning = matchFactors.length > 0 
      ? `This style matches your image because: ${matchFactors.join(', ')}`
      : 'This style offers a versatile artistic interpretation of your image';

    confidence = Math.min(confidence, 0.95);

    recommendations.push({
      styleId: style.id,
      confidence,
      reasoning,
      matchFactors
    });
  });

  return recommendations.sort((a, b) => b.confidence - a.confidence);
};

export const getTopRecommendations = (analysis: ImageAnalysis, orientation: string, count: number = 3): StyleRecommendation[] => {
  const allRecommendations = getStyleRecommendations(analysis, orientation);
  return allRecommendations.slice(0, count);
};
