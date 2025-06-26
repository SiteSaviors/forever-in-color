
import { analyzeImageForRecommendations, ImageAnalysis } from "./imageAnalysis";
import { generateFallbackRecommendations, sortRecommendations, StyleRecommendation } from "./fallbackRecommendations";
import { generateSmartRecommendations, recordStyleChoice } from "./smartRecommendationIntegration";

// Re-export types and functions for backward compatibility
export type { StyleRecommendation, ImageAnalysis };
export { recordStyleChoice };

// Main recommendation generation function
export const generateStyleRecommendations = async (
  analysis: ImageAnalysis,
  imageUrl?: string
): Promise<StyleRecommendation[]> => {
  let recommendations: StyleRecommendation[] = [];
  
  try {
    // Try to get smart recommendations first
    if (imageUrl) {
      recommendations = await generateSmartRecommendations(analysis, imageUrl);
    }
  } catch (error) {
    console.warn('Smart recommendations failed, using fallback:', error);
  }
  
  // If no smart recommendations, use fallback logic
  if (recommendations.length === 0) {
    console.log('📊 Using fallback recommendation logic...');
    recommendations = generateFallbackRecommendations(analysis);
  }
  
  // Sort by confidence and category priority
  return sortRecommendations(recommendations);
};

// Re-export the image analysis function
export { analyzeImageForRecommendations };
