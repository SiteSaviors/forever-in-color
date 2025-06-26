
import { PhotoAnalysisResult } from '../photoAnalysis/types';
import { SmartRecommendation, ContextualFactors, UserPreference } from './types';
import { MLRecommendationEngine } from './MLRecommendationEngine';

export class SmartRecommendationEngine {
  private mlEngine: MLRecommendationEngine;
  private userPreferences: Map<string, UserPreference>;
  private sessionData: Map<string, any>;

  constructor() {
    this.mlEngine = new MLRecommendationEngine();
    this.userPreferences = new Map();
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
        this.updateUserPreferences(userId, styleId, analysis, completed);
      }
      
      console.log('✅ User choice recorded successfully');
    } catch (error) {
      console.error('❌ Failed to record user choice:', error);
    }
  }

  getUserPreferences(userId: string): UserPreference | null {
    return this.userPreferences.get(userId) || null;
  }

  updateUserPreferences(
    userId: string,
    styleId: number,
    analysis: PhotoAnalysisResult,
    completed: boolean
  ): void {
    let preferences = this.userPreferences.get(userId) || {
      favoriteStyles: [],
      colorPreferences: [],
      complexityPreference: 'moderate',
      orientationPreference: 'square',
      lastInteraction: Date.now(),
      totalInteractions: 0,
      completionRate: 0
    };

    // Update preferences based on user action
    if (completed && !preferences.favoriteStyles.includes(styleId)) {
      preferences.favoriteStyles.push(styleId);
    }

    // Update color preferences
    analysis.dominantColors.forEach(color => {
      if (!preferences.colorPreferences.includes(color)) {
        preferences.colorPreferences.push(color);
      }
    });

    // Update other preferences
    preferences.complexityPreference = analysis.complexity;
    preferences.orientationPreference = analysis.orientation;
    preferences.lastInteraction = Date.now();
    preferences.totalInteractions++;

    // Calculate completion rate
    const completions = preferences.favoriteStyles.length;
    preferences.completionRate = completions / preferences.totalInteractions;

    this.userPreferences.set(userId, preferences);
    
    // Persist to localStorage for demo
    try {
      localStorage.setItem(`user_pref_${userId}`, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Could not persist user preferences:', error);
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
        category: 'popular'
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

  // Analytics and insights
  getAnalytics(): {
    totalUsers: number;
    averageCompletionRate: number;
    topStyles: Array<{ styleId: number; count: number }>;
    colorTrends: Array<{ color: string; count: number }>;
  } {
    const users = Array.from(this.userPreferences.values());
    const totalUsers = users.length;
    
    const avgCompletionRate = users.length > 0 
      ? users.reduce((sum, user) => sum + user.completionRate, 0) / users.length 
      : 0;
    
    // Calculate top styles
    const styleCounts = new Map<number, number>();
    users.forEach(user => {
      user.favoriteStyles.forEach(styleId => {
        styleCounts.set(styleId, (styleCounts.get(styleId) || 0) + 1);
      });
    });
    
    const topStyles = Array.from(styleCounts.entries())
      .map(([styleId, count]) => ({ styleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate color trends
    const colorCounts = new Map<string, number>();
    users.forEach(user => {
      user.colorPreferences.forEach(color => {
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      });
    });
    
    const colorTrends = Array.from(colorCounts.entries())
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    
    return {
      totalUsers,
      averageCompletionRate,
      topStyles,
      colorTrends
    };
  }

  // Load persisted preferences
  loadPersistedPreferences(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('user_pref_')) {
          const userId = key.replace('user_pref_', '');
          const preferences = JSON.parse(localStorage.getItem(key) || '{}');
          this.userPreferences.set(userId, preferences);
        }
      }
      console.log(`✅ Loaded ${this.userPreferences.size} user preference profiles`);
    } catch (error) {
      console.warn('Could not load persisted preferences:', error);
    }
  }
}
