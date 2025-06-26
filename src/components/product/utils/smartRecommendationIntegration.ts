
import { artStyles } from "@/data/artStyles";
import { photoAnalysisEngine } from "@/utils/photoAnalysisEngine";
import { smartRecommendationEngine } from "@/utils/smartRecommendations";
import { StyleRecommendation } from "./fallbackRecommendations";
import { ImageAnalysis } from "./imageAnalysis";

export const generateSmartRecommendations = async (
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
      
      return recommendations;
    }
  } catch (error) {
    console.warn('Smart recommendations failed:', error);
  }
  
  return recommendations;
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
