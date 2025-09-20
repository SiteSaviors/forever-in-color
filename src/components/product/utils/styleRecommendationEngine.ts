import { artStyles } from "@/data/artStyles";

export interface StyleRecommendation {
  styleId: number;
  styleName: string;
  confidence: number;
  reason: string;
  category: 'hero' | 'popular' | 'secondary';
}

export interface ImageAnalysis {
  orientation: string;
  hasPortrait: boolean;
  isLandscape: boolean;
  hasHighContrast: boolean;
  dominantColors: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

// Analyze image characteristics for smart recommendations
export const analyzeImageForRecommendations = async (imageUrl: string): Promise<ImageAnalysis> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        // Fallback analysis
        resolve({
          orientation: 'square',
          hasPortrait: false,
          isLandscape: img.width > img.height,
          hasHighContrast: false,
          dominantColors: ['neutral'],
          complexity: 'moderate'
        });
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const aspectRatio = img.width / img.height;
      const isLandscape = aspectRatio > 1.2;
      const isPortrait = aspectRatio < 0.8;

      // Basic color analysis (simplified for performance)
      const imageData = ctx.getImageData(0, 0, Math.min(100, img.width), Math.min(100, img.height));
      const pixels = imageData.data;
      let totalBrightness = 0;
      let brightPixels = 0;
      let darkPixels = 0;

      for (let i = 0; i < pixels.length; i += 16) { // Sample every 4th pixel
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
    };

    img.onerror = () => {
      // Fallback for failed analysis
      resolve({
        orientation: 'square',
        hasPortrait: false,
        isLandscape: false,
        hasHighContrast: false,
        dominantColors: ['neutral'],
        complexity: 'moderate'
      });
    };

    img.src = imageUrl;
  });
};

// Generate intelligent style recommendations
export const generateStyleRecommendations = (analysis: ImageAnalysis): StyleRecommendation[] => {
  const recommendations: StyleRecommendation[] = [];

  // Hero recommendations (top 3 most relevant) - Always include Watercolor Dreams as first recommendation
  const baseWatercolorRecommendation = {
    styleId: 4,
    styleName: "Watercolor Dreams",
    confidence: 0.92,
    reason: "Perfect artistic style that enhances any photo with flowing, natural effects",
    category: 'hero' as const
  };

  if (analysis.hasPortrait) {
    recommendations.push(
      baseWatercolorRecommendation,
      {
        styleId: 5,
        styleName: "Pastel Bliss",
        confidence: 0.9,
        reason: "Perfect for portraits with soft, flattering tones",
        category: 'hero'
      },
      {
        styleId: 2,
        styleName: "Classic Oil Painting",
        confidence: 0.85,
        reason: "Traditional portrait style with rich depth",
        category: 'hero'
      }
    );
  } else if (analysis.isLandscape) {
    recommendations.push(
      {
        ...baseWatercolorRecommendation,
        reason: "Ideal for landscapes with flowing, natural effects"
      },
      {
        styleId: 13,
        styleName: "Abstract Fusion",
        confidence: 0.82,
        reason: "Perfect for wide compositions",
        category: 'hero'
      },
      {
        styleId: 2,
        styleName: "Classic Oil Painting",
        confidence: 0.80,
        reason: "Classic landscape treatment with rich textures",
        category: 'hero'
      }
    );
  } else if (analysis.hasHighContrast) {
    recommendations.push(
      {
        ...baseWatercolorRecommendation,
        reason: "Softens high contrast while maintaining visual impact"
      },
      {
        styleId: 9,
        styleName: "Pop Art Burst",
        confidence: 0.9,
        reason: "High contrast photos shine with bold pop art colors",
        category: 'hero'
      },
      {
        styleId: 10,
        styleName: "Neon Splash",
        confidence: 0.85,
        reason: "Dynamic contrast creates stunning neon effects",
        category: 'hero'
      }
    );
  } else {
    // Fallback hero recommendations for square/neutral images - Always start with Watercolor Dreams
    recommendations.push(
      baseWatercolorRecommendation,
      {
        styleId: 2,
        styleName: "Classic Oil Painting",
        confidence: 0.8,
        reason: "Timeless classic that works beautifully with any photo",
        category: 'hero'
      },
      {
        styleId: 5,
        styleName: "Pastel Bliss",
        confidence: 0.76,
        reason: "Gentle, dreamy style that enhances your image",
        category: 'hero'
      }
    );
  }

  // Popular choices (social proof)
  const popularStyles = [2, 4, 5, 9, 7]; // Most popular based on user data
  popularStyles.forEach(styleId => {
    if (!recommendations.find(r => r.styleId === styleId)) {
      const style = artStyles.find(s => s.id === styleId);
      if (style) {
        recommendations.push({
          styleId,
          styleName: style.name,
          confidence: 0.7,
          reason: "Popular choice among customers",
          category: 'popular'
        });
      }
    }
  });

  // Secondary recommendations (remaining styles)
  artStyles.forEach(style => {
    if (!recommendations.find(r => r.styleId === style.id)) {
      recommendations.push({
        styleId: style.id,
        styleName: style.name,
        confidence: 0.5,
        reason: "Explore this unique artistic style",
        category: 'secondary'
      });
    }
  });

  return recommendations.sort((a, b) => {
    // Sort by category priority, then by confidence
    const categoryOrder = { 'hero': 0, 'popular': 1, 'secondary': 2 };
    const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category];
    if (categoryDiff !== 0) return categoryDiff;
    return b.confidence - a.confidence;
  });
};
