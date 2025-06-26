
import { artStyles } from "@/data/artStyles";
import { photoAnalysisEngine } from "@/utils/photoAnalysisEngine";
import { smartRecommendationEngine } from "@/utils/smartRecommendations";

export interface StyleRecommendation {
  styleId: number;
  styleName: string;
  confidence: number;
  reason: string;
  category: 'hero' | 'popular' | 'secondary' | 'ai-perfect' | 'personal';
  isPreloaded?: boolean;
  analysisMatch?: number;
}

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

// Enhanced style recommendations using both engines
export const generateStyleRecommendations = async (
  analysis: ImageAnalysis,
  imageUrl?: string
): Promise<StyleRecommendation[]> => {
  const recommendations: StyleRecommendation[] = [];
  
  try {
    // If we have the image URL, use smart recommendations
    if (imageUrl) {
      console.log('🧠 Generating smart AI-powered recommendations...');
      
      const photoAnalysis = await photoAnalysisEngine.analyzePhoto(imageUrl);
      const smartRecs = smartRecommendationEngine.generateRecommendations(photoAnalysis, {
        timeOfDay: new Date().getHours(),
        isFirstTime: !localStorage.getItem('artify_user_preferences'),
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
      });
      
      // Convert smart recommendations to our format
      smartRecs.forEach(smartRec => {
        const style = artStyles.find(s => s.id === smartRec.styleId);
        if (style) {
          recommendations.push({
            styleId: smartRec.styleId,
            styleName: style.name,
            confidence: smartRec.confidence,
            reason: smartRec.reason,
            category: smartRec.category === 'ai-perfect' ? 'hero' : 
                     smartRec.category === 'personal' ? 'hero' :
                     smartRec.category === 'trending' ? 'popular' : 'secondary',
            analysisMatch: photoAnalysis.styleAffinities[smartRec.styleId] || 0
          });
        }
      });
      
      // Record this analysis for learning
      // Note: We'll record the actual selection later when user makes a choice
      
    } else {
      console.log('📊 Using fallback recommendation logic...');
      // Fallback to original logic when no image URL available
      recommendations.push(...generateFallbackRecommendations(analysis));
    }
  } catch (error) {
    console.warn('Smart recommendations failed, using fallback:', error);
    recommendations.push(...generateFallbackRecommendations(analysis));
  }
  
  // Ensure we have some recommendations
  if (recommendations.length === 0) {
    recommendations.push(...generateFallbackRecommendations(analysis));
  }
  
  // Sort by confidence and category priority
  return sortRecommendations(recommendations);
};

const generateFallbackRecommendations = (analysis: ImageAnalysis): StyleRecommendation[] => {
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

const sortRecommendations = (recommendations: StyleRecommendation[]): StyleRecommendation[] => {
  const categoryOrder = { 'hero': 0, 'ai-perfect': 0, 'personal': 1, 'popular': 2, 'secondary': 3 };
  
  return recommendations.sort((a, b) => {
    // Sort by category priority, then by confidence
    const categoryDiff = (categoryOrder[a.category] || 999) - (categoryOrder[b.category] || 999);
    if (categoryDiff !== 0) return categoryDiff;
    return b.confidence - a.confidence;
  });
};

// Helper function to record user choices for learning
export const recordStyleChoice = (
  styleId: number, 
  imageUrl: string | null, 
  completed: boolean = false
): void => {
  if (!imageUrl) return;
  
  try {
    // This will be called when user actually selects a style
    photoAnalysisEngine.analyzePhoto(imageUrl)
      .then(analysis => {
        smartRecommendationEngine.recordUserChoice(styleId, analysis, completed);
      })
      .catch(error => {
        console.warn('Could not record style choice:', error);
      });
  } catch (error) {
    console.warn('Error recording style choice:', error);
  }
};
