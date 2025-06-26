
import { PhotoAnalysisResult } from '../../photoAnalysis/types';
import { SmartRecommendation, ContextualFactors, UserPreference } from '../types';

export interface IRecommendationEngine {
  generateRecommendations(
    analysis: PhotoAnalysisResult,
    contextualFactors: ContextualFactors,
    userId?: string
  ): SmartRecommendation[];
  
  recordUserChoice(
    styleId: number,
    analysis: PhotoAnalysisResult,
    completed: boolean,
    userId?: string
  ): void;
}

export abstract class BaseRecommendationEngine implements IRecommendationEngine {
  protected userPreferences: Map<string, UserPreference>;
  protected sessionData: Map<string, any>;

  constructor() {
    this.userPreferences = new Map();
    this.sessionData = new Map();
  }

  abstract generateRecommendations(
    analysis: PhotoAnalysisResult,
    contextualFactors: ContextualFactors,
    userId?: string
  ): SmartRecommendation[];

  abstract recordUserChoice(
    styleId: number,
    analysis: PhotoAnalysisResult,
    completed: boolean,
    userId?: string
  ): void;

  protected getFallbackRecommendations(analysis: PhotoAnalysisResult): SmartRecommendation[] {
    console.log('⚠️ Using fallback recommendation logic...');
    
    const fallbackRecs: SmartRecommendation[] = [
      {
        styleId: 2,
        confidence: 0.8,
        reason: analysis.hasPortrait ? 'Perfect for portraits' : 'Classic artistic style',
        category: 'ai-perfect'
      },
      {
        styleId: 4,
        confidence: 0.7,
        reason: 'Soft watercolor effect enhances your photo',
        category: 'ai-perfect'
      },
      {
        styleId: 5,
        confidence: 0.6,
        reason: 'Gentle pastel tones create beautiful results',
        category: 'trending'
      },
      {
        styleId: 9,
        confidence: 0.65,
        reason: 'Vibrant pop art style adds energy',
        category: 'trending'
      }
    ];

    return fallbackRecs;
  }
}
