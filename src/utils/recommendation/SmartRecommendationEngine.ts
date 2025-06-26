
import { PhotoAnalysisResult } from '../photoAnalysis/types';
import { SmartRecommendation, ContextualFactors } from './types';
import { MLRecommendationEngine } from './engines/MLRecommendationEngine';
import { UserPreferencesManager } from './managers/UserPreferencesManager';
import { AnalyticsManager, RecommendationAnalytics } from './managers/AnalyticsManager';

export class SmartRecommendationEngine {
  private mlEngine: MLRecommendationEngine;
  private userPreferencesManager: UserPreferencesManager;
  private analyticsManager: AnalyticsManager;
  private sessionData: Map<string, any>;

  constructor() {
    this.mlEngine = new MLRecommendationEngine();
    this.userPreferencesManager = new UserPreferencesManager();
    this.analyticsManager = new AnalyticsManager(this.userPreferencesManager.getUserPreferences());
    this.sessionData = new Map();
    
    console.log('🧠 SmartRecommendationEngine initialized with ML capabilities');
  }

  generateRecommendations(
    analysis: PhotoAnalysisResult,
    contextualFactors: ContextualFactors,
    userId?: string
  ): SmartRecommendation[] {
    console.log('🎯 Generating ML-powered smart recommendations...', {
      userId: userId ? 'provided' : 'anonymous',
      analysisConfidence: analysis.confidence,
      contextualFactors
    });

    try {
      // Use ML engine for intelligent recommendations
      const recommendations = this.mlEngine.generateRecommendations(
        analysis,
        contextualFactors,
        userId
      );

      console.log(`✅ Generated ${recommendations.length} smart recommendations:`, 
        recommendations.map(r => ({ 
          styleId: r.styleId, 
          confidence: r.confidence, 
          category: r.category 
        }))
      );

      return recommendations;
    } catch (error) {
      console.error('❌ ML recommendation generation failed:', error);
      
      // Fallback to basic recommendations
      return this.getFallbackRecommendations(analysis);
    }
  }

  recordUserChoice(
    styleId: number,
    analysis: PhotoAnalysisResult,
    completed: boolean = false,
    userId?: string
  ): void {
    console.log(`📊 Recording user choice: Style ${styleId}, completed: ${completed}, user: ${userId || 'anonymous'}`);
    
    try {
      // Record in ML engine for learning
      this.mlEngine.recordUserChoice(styleId, analysis, completed, userId);
      
      // Update user preferences if userId provided
      if (userId) {
        this.userPreferencesManager.updateUserPreferences(userId, styleId, analysis, completed);
      }

      // Log analytics
      this.analyticsManager.logInteraction(userId || 'anonymous', 'style_selection', {
        styleId,
        completed,
        imageType: analysis.subjectType
      });
      
      console.log('✅ User choice recorded successfully');
    } catch (error) {
      console.error('❌ Failed to record user choice:', error);
    }
  }

  getUserPreferences(userId: string) {
    return this.userPreferencesManager.getUserPreference(userId);
  }

  getAnalytics(): RecommendationAnalytics {
    return this.analyticsManager.getAnalytics();
  }

  // Session management
  startSession(sessionId: string, userId?: string): void {
    this.sessionData.set(sessionId, {
      userId,
      startTime: Date.now(),
      interactions: [],
      preferences: userId ? this.getUserPreferences(userId) : null
    });
  }

  endSession(sessionId: string): void {
    const session = this.sessionData.get(sessionId);
    if (session) {
      const duration = Date.now() - session.startTime;
      console.log(`📊 Session ${sessionId} ended after ${Math.round(duration / 1000)}s with ${session.interactions.length} interactions`);
      
      // Clean up session data
      this.sessionData.delete(sessionId);
    }
  }

  private getFallbackRecommendations(analysis: PhotoAnalysisResult): SmartRecommendation[] {
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
