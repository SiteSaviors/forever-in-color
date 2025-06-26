
import { PhotoAnalysisResult } from '../photoAnalysisEngine';
import { 
  SmartRecommendation, 
  ContextualFactors, 
  SessionContext,
  RecommendationGeneratorParams 
} from './types';
import { UserPreferencesManager } from './userPreferences';
import { RecommendationGenerators } from './recommendationGenerators';
import { ContextualAdjustments } from './contextualAdjustments';

export class SmartRecommendationEngine {
  private userPreferencesManager: UserPreferencesManager;
  private globalTrends: Map<number, number> = new Map();
  private sessionContext: SessionContext;

  constructor() {
    this.userPreferencesManager = new UserPreferencesManager();
    this.sessionContext = {
      startTime: Date.now(),
      interactions: 0,
      previousSelections: []
    };
    this.loadGlobalTrends();
  }

  generateRecommendations(
    analysis: PhotoAnalysisResult,
    contextualFactors?: ContextualFactors
  ): SmartRecommendation[] {
    console.log('🧠 Generating smart recommendations...');
    
    const recommendations: SmartRecommendation[] = [];
    const params: RecommendationGeneratorParams = {
      analysis,
      userPreferences: this.userPreferencesManager.getUserPreferences(),
      globalTrends: this.globalTrends,
      sessionContext: this.sessionContext
    };
    
    // Generate different types of recommendations
    const aiRecommendations = RecommendationGenerators.generateAIRecommendations(analysis);
    const personalRecommendations = RecommendationGenerators.generatePersonalRecommendations(params);
    const trendingRecommendations = RecommendationGenerators.generateTrendingRecommendations(this.globalTrends);
    const discoveryRecommendations = RecommendationGenerators.generateDiscoveryRecommendations(params);
    
    recommendations.push(
      ...aiRecommendations,
      ...personalRecommendations,
      ...trendingRecommendations,
      ...discoveryRecommendations
    );
    
    // Apply contextual adjustments
    if (contextualFactors) {
      ContextualAdjustments.applyAdjustments(recommendations, contextualFactors);
    }
    
    // Sort by confidence and category priority
    return this.prioritizeRecommendations(recommendations);
  }

  recordUserChoice(styleId: number, imageAnalysis: PhotoAnalysisResult, completed: boolean): void {
    this.sessionContext.interactions++;
    this.sessionContext.previousSelections.push(styleId);
    
    this.userPreferencesManager.recordUserChoice(styleId, imageAnalysis, completed);
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

  private loadGlobalTrends(): void {
    // Simulate global trends data - in real app, this would come from analytics
    this.globalTrends.set(2, 85); // Classic Oil - 85% popularity
    this.globalTrends.set(4, 72); // Watercolor Dreams - 72% popularity
    this.globalTrends.set(5, 68); // Pastel Bliss - 68% popularity
    this.globalTrends.set(9, 61); // Pop Art Burst - 61% popularity
    this.globalTrends.set(7, 55); // 3D Storybook - 55% popularity
  }
}
