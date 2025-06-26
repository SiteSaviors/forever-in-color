
import { SmartRecommendation, RecommendationGeneratorParams } from './types';
import { PhotoAnalysisResult } from '../photoAnalysisEngine';

export class RecommendationGenerators {
  static generateAIRecommendations(analysis: PhotoAnalysisResult): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // Get top 3 AI-analyzed styles
    const topStyles = analysis.recommendedStyles.slice(0, 3);
    
    topStyles.forEach((styleId, index) => {
      const confidence = analysis.styleAffinities[styleId];
      const reason = this.generateAIReason(styleId, analysis);
      
      recommendations.push({
        styleId,
        confidence: confidence * 0.9, // Slight reduction to allow for other factors
        reason,
        category: 'ai-perfect',
        urgency: index === 0 ? 'high' : 'medium'
      });
    });
    
    return recommendations;
  }

  static generatePersonalRecommendations(params: RecommendationGeneratorParams): SmartRecommendation[] {
    if (params.userPreferences.length === 0) return [];
    
    const recommendations: SmartRecommendation[] = [];
    
    // Find preferences that match current image characteristics
    const matchingPreferences = params.userPreferences.filter(pref => 
      pref.context.orientation === params.analysis.orientation ||
      pref.context.imageType === params.analysis.subjectType
    );
    
    // Get top personal preferences
    const topPersonal = matchingPreferences
      .sort((a, b) => (b.frequency * b.satisfaction) - (a.frequency * a.satisfaction))
      .slice(0, 2);
    
    topPersonal.forEach(pref => {
      const personalScore = (pref.frequency / 10) * pref.satisfaction;
      
      recommendations.push({
        styleId: pref.styleId,
        confidence: Math.min(0.8, personalScore),
        reason: `Based on your previous choices for ${pref.context.imageType} photos`,
        category: 'personal',
        urgency: 'medium'
      });
    });
    
    return recommendations;
  }

  static generateTrendingRecommendations(globalTrends: Map<number, number>): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // Get currently trending styles
    const trendingStyles = Array.from(globalTrends.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
    
    trendingStyles.forEach(([styleId, trendScore]) => {
      recommendations.push({
        styleId,
        confidence: Math.min(0.7, trendScore / 100),
        reason: `Trending choice - ${Math.floor(trendScore)}% more popular this week`,
        category: 'trending',
        urgency: 'low'
      });
    });
    
    return recommendations;
  }

  static generateDiscoveryRecommendations(params: RecommendationGeneratorParams): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // Suggest styles user hasn't tried yet
    const usedStyles = new Set(params.userPreferences.map(p => p.styleId));
    const allStyles = [2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15]; // Available styles
    const unusedStyles = allStyles.filter(styleId => !usedStyles.has(styleId));
    
    // Pick one discovery style with moderate affinity
    const discoveryStyle = unusedStyles.find(styleId => 
      params.analysis.styleAffinities[styleId] > 0.4
    );
    
    if (discoveryStyle) {
      recommendations.push({
        styleId: discoveryStyle,
        confidence: 0.5,
        reason: 'Discover something new - this style might surprise you!',
        category: 'discovery',
        urgency: 'low'
      });
    }
    
    return recommendations;
  }

  private static generateAIReason(styleId: number, analysis: PhotoAnalysisResult): string {
    const reasons: { [key: number]: (analysis: PhotoAnalysisResult) => string } = {
      2: (a) => a.hasPortrait ? 'Perfect for portraits with rich, classical depth' : 'Classic oil technique enhances your image beautifully',
      4: (a) => a.isLandscape ? 'Ideal for landscapes with flowing watercolor effects' : 'Soft watercolor style creates dreamy atmosphere',
      5: (a) => a.brightness === 'bright' ? 'Pastel tones perfect for bright, cheerful photos' : 'Gentle pastels add warmth and softness',
      8: (a) => a.contrast === 'high' ? 'High contrast perfect for dramatic charcoal effect' : 'Artistic charcoal style adds timeless elegance',
      9: (a) => a.saturation === 'vibrant' ? 'Vibrant colors ideal for bold pop art style' : 'Pop art brings energy and modern appeal',
    };
    
    const reasonGenerator = reasons[styleId];
    return reasonGenerator ? reasonGenerator(analysis) : 'AI recommends this style for your image';
  }
}
