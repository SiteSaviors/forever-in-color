
import { PhotoAnalysisResult } from './photoAnalysisEngine';

export interface UserPreference {
  styleId: number;
  frequency: number;
  context: {
    imageType: string;
    orientation: string;
    timeOfDay: number;
  };
  satisfaction: number; // 0-1 based on completion rate
}

export interface SmartRecommendation {
  styleId: number;
  confidence: number;
  reason: string;
  category: 'ai-perfect' | 'trending' | 'personal' | 'discovery';
  urgency: 'high' | 'medium' | 'low';
}

export class SmartRecommendationEngine {
  private userPreferences: UserPreference[] = [];
  private globalTrends: Map<number, number> = new Map();
  private sessionContext: {
    startTime: number;
    interactions: number;
    previousSelections: number[];
  };

  constructor() {
    this.sessionContext = {
      startTime: Date.now(),
      interactions: 0,
      previousSelections: []
    };
    this.loadUserPreferences();
    this.loadGlobalTrends();
  }

  generateRecommendations(
    analysis: PhotoAnalysisResult,
    contextualFactors?: {
      timeOfDay?: number;
      isFirstTime?: boolean;
      deviceType?: 'mobile' | 'desktop';
    }
  ): SmartRecommendation[] {
    console.log('🧠 Generating smart recommendations...');
    
    const recommendations: SmartRecommendation[] = [];
    
    // AI-Perfect recommendations based on photo analysis
    const aiRecommendations = this.generateAIRecommendations(analysis);
    recommendations.push(...aiRecommendations);
    
    // Personal recommendations based on user history
    const personalRecommendations = this.generatePersonalRecommendations(analysis);
    recommendations.push(...personalRecommendations);
    
    // Trending recommendations based on global data
    const trendingRecommendations = this.generateTrendingRecommendations(analysis);
    recommendations.push(...trendingRecommendations);
    
    // Discovery recommendations for variety
    const discoveryRecommendations = this.generateDiscoveryRecommendations(analysis);
    recommendations.push(...discoveryRecommendations);
    
    // Apply contextual adjustments
    if (contextualFactors) {
      this.applyContextualAdjustments(recommendations, contextualFactors);
    }
    
    // Sort by confidence and category priority
    return this.prioritizeRecommendations(recommendations);
  }

  private generateAIRecommendations(analysis: PhotoAnalysisResult): SmartRecommendation[] {
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

  private generatePersonalRecommendations(analysis: PhotoAnalysisResult): SmartRecommendation[] {
    if (this.userPreferences.length === 0) return [];
    
    const recommendations: SmartRecommendation[] = [];
    
    // Find preferences that match current image characteristics
    const matchingPreferences = this.userPreferences.filter(pref => 
      pref.context.orientation === analysis.orientation ||
      pref.context.imageType === analysis.subjectType
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

  private generateTrendingRecommendations(analysis: PhotoAnalysisResult): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // Get currently trending styles
    const trendingStyles = Array.from(this.globalTrends.entries())
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

  private generateDiscoveryRecommendations(analysis: PhotoAnalysisResult): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // Suggest styles user hasn't tried yet
    const usedStyles = new Set(this.userPreferences.map(p => p.styleId));
    const allStyles = [2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15]; // Available styles
    const unusedStyles = allStyles.filter(styleId => !usedStyles.has(styleId));
    
    // Pick one discovery style with moderate affinity
    const discoveryStyle = unusedStyles.find(styleId => 
      analysis.styleAffinities[styleId] > 0.4
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

  private generateAIReason(styleId: number, analysis: PhotoAnalysisResult): string {
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

  private applyContextualAdjustments(
    recommendations: SmartRecommendation[],
    factors: any
  ): void {
    // Time-based adjustments
    if (factors.timeOfDay !== undefined) {
      const hour = factors.timeOfDay;
      
      // Evening hours - suggest warmer, more dramatic styles
      if (hour >= 18 || hour <= 6) {
        recommendations.forEach(rec => {
          if ([2, 8, 15].includes(rec.styleId)) { // Classic, Charcoal, Deco
            rec.confidence *= 1.1;
          }
        });
      }
    }
    
    // First-time user adjustments
    if (factors.isFirstTime) {
      recommendations.forEach(rec => {
        if (rec.category === 'ai-perfect') {
          rec.confidence *= 1.2; // Boost AI recommendations for new users
          rec.urgency = 'high';
        }
      });
    }
    
    // Mobile device adjustments
    if (factors.deviceType === 'mobile') {
      // Boost simpler, more mobile-friendly styles
      recommendations.forEach(rec => {
        if ([5, 7, 10].includes(rec.styleId)) { // Pastel, 3D, Neon
          rec.confidence *= 1.05;
        }
      });
    }
  }

  private prioritizeRecommendations(recommendations: SmartRecommendation[]): SmartRecommendation[] {
    const categoryPriority = {
      'ai-perfect': 4,
      'personal': 3,
      'trending': 2,
      'discovery': 1
    };
    
    const urgencyMultiplier = {
      'high': 1.2,
      'medium': 1.0,
      'low': 0.8
    };
    
    return recommendations
      .map(rec => ({
        ...rec,
        finalScore: rec.confidence * categoryPriority[rec.category] * urgencyMultiplier[rec.urgency]
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 6); // Return top 6 recommendations
  }

  recordUserChoice(styleId: number, imageAnalysis: PhotoAnalysisResult, completed: boolean): void {
    this.sessionContext.interactions++;
    this.sessionContext.previousSelections.push(styleId);
    
    // Update user preferences
    const existingPref = this.userPreferences.find(p => 
      p.styleId === styleId &&
      p.context.orientation === imageAnalysis.orientation &&
      p.context.imageType === imageAnalysis.subjectType
    );
    
    if (existingPref) {
      existingPref.frequency++;
      existingPref.satisfaction = completed ? Math.min(1, existingPref.satisfaction + 0.1) : Math.max(0, existingPref.satisfaction - 0.1);
    } else {
      this.userPreferences.push({
        styleId,
        frequency: 1,
        context: {
          imageType: imageAnalysis.subjectType,
          orientation: imageAnalysis.orientation,
          timeOfDay: new Date().getHours()
        },
        satisfaction: completed ? 0.8 : 0.3
      });
    }
    
    this.saveUserPreferences();
  }

  private loadUserPreferences(): void {
    try {
      const stored = localStorage.getItem('artify_user_preferences');
      if (stored) {
        this.userPreferences = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load user preferences:', error);
    }
  }

  private saveUserPreferences(): void {
    try {
      localStorage.setItem('artify_user_preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.warn('Could not save user preferences:', error);
    }
  }

  private loadGlobalTrends(): void {
    // Simulate global trends data - in real app, this would come from analytics
    this.globalTrends.set(2, 85); // Classic Oil - 85% popularity
    this.globalTrends.set(4, 72); // Watercolor Dreams - 72% popularity
    this.globalTrends.set(5, 68); // Pastel Bliss - 68% popularity
    this.globalTrends.set(9, 61); // Pop Art Burst - 61% popularity
    this.globalTrends.set(7, 55); // 3D Storybook - 55% popularity
  }
}

export const smartRecommendationEngine = new SmartRecommendationEngine();
