
import { artStyles } from "@/data/artStyles";
import { ImageAnalysis } from "./imageAnalysis";

export interface StyleRecommendation {
  styleId: number;
  styleName: string;
  confidence: number;
  reason: string;
  category: 'hero' | 'popular' | 'secondary' | 'ai-perfect' | 'personal';
  isPreloaded?: boolean;
  analysisMatch?: number;
}

export const generateFallbackRecommendations = (analysis: ImageAnalysis): StyleRecommendation[] => {
  const recommendations: StyleRecommendation[] = [];

  // Hero recommendations (top 3 most relevant)
  if (analysis.hasPortrait) {
    recommendations.push({
      styleId: 5,
      styleName: "Pastel Bliss",
      confidence: 0.9,
      reason: "Perfect for portraits with soft, flattering tones",
      category: 'hero'
    });
    recommendations.push({
      styleId: 2,
      styleName: "Classic Oil Painting",
      confidence: 0.85,
      reason: "Traditional portrait style with rich depth",
      category: 'hero'
    });
  }

  if (analysis.isLandscape) {
    recommendations.push({
      styleId: 4,
      styleName: "Watercolor Dreams",
      confidence: 0.88,
      reason: "Ideal for landscapes with flowing, natural effects",
      category: 'hero'
    });
    recommendations.push({
      styleId: 13,
      styleName: "Abstract Fusion",
      confidence: 0.82,
      reason: "Perfect for wide compositions",
      category: 'hero'
    });
  }

  if (analysis.hasHighContrast) {
    recommendations.push({
      styleId: 9,
      styleName: "Pop Art Burst",
      confidence: 0.9,
      reason: "High contrast photos shine with bold pop art colors",
      category: 'hero'
    });
    recommendations.push({
      styleId: 10,
      styleName: "Neon Splash",
      confidence: 0.85,
      reason: "Dynamic contrast creates stunning neon effects",
      category: 'hero'
    });
  }

  // Fallback hero recommendations for square/neutral images
  if (recommendations.filter(r => r.category === 'hero').length === 0) {
    recommendations.push(
      {
        styleId: 2,
        styleName: "Classic Oil Painting",
        confidence: 0.8,
        reason: "Timeless classic that works beautifully with any photo",
        category: 'hero'
      },
      {
        styleId: 4,
        styleName: "Watercolor Dreams",
        confidence: 0.78,
        reason: "Soft, artistic appeal perfect for your composition",
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

  return recommendations;
};

export const sortRecommendations = (recommendations: StyleRecommendation[]): StyleRecommendation[] => {
  const categoryOrder = { 'hero': 0, 'ai-perfect': 0, 'personal': 1, 'popular': 2, 'secondary': 3 };
  
  return recommendations.sort((a, b) => {
    // Sort by category priority, then by confidence
    const categoryDiff = (categoryOrder[a.category] || 999) - (categoryOrder[b.category] || 999);
    if (categoryDiff !== 0) return categoryDiff;
    return b.confidence - a.confidence;
  });
};
