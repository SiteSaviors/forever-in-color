
import { PhotoAnalysisResult } from '../../photoAnalysis/types';
import { SmartRecommendation, ContextualFactors, UserPreference } from '../types';
import { BaseRecommendationEngine } from '../core/RecommendationEngineCore';
import { ContextualAdjustments } from '../contextualAdjustments';

export class MLRecommendationEngine extends BaseRecommendationEngine {
  private mlModelsLoaded: boolean = false;
  private confidenceThreshold: number = 0.3;

  constructor() {
    super();
    console.log('🤖 MLRecommendationEngine initialized');
  }

  generateRecommendations(
    analysis: PhotoAnalysisResult,
    contextualFactors: ContextualFactors,
    userId?: string
  ): SmartRecommendation[] {
    console.log('🧠 Generating ML-powered recommendations...', {
      userId: userId ? 'provided' : 'anonymous',
      analysisConfidence: analysis.confidence,
      contextualFactors
    });

    try {
      // Generate base recommendations using ML
      const baseRecommendations = this.generateBaseRecommendations(analysis, userId);
      
      // Apply contextual adjustments
      ContextualAdjustments.applyAdjustments(baseRecommendations, contextualFactors);
      
      // Filter by confidence threshold
      const filteredRecs = baseRecommendations.filter(rec => rec.confidence >= this.confidenceThreshold);
      
      // Sort by confidence
      const sortedRecs = filteredRecs.sort((a, b) => b.confidence - a.confidence);
      
      console.log(`✅ Generated ${sortedRecs.length} ML recommendations:`, 
        sortedRecs.map(r => ({ 
          styleId: r.styleId, 
          confidence: r.confidence, 
          category: r.category 
        }))
      );

      return sortedRecs;
    } catch (error) {
      console.error('❌ ML recommendation generation failed:', error);
      return this.getFallbackRecommendations(analysis);
    }
  }

  recordUserChoice(
    styleId: number,
    analysis: PhotoAnalysisResult,
    completed: boolean,
    userId?: string
  ): void {
    console.log(`📊 Recording ML user choice: Style ${styleId}, completed: ${completed}, user: ${userId || 'anonymous'}`);
    
    try {
      // Record for ML learning
      this.updateMLModel(styleId, analysis, completed, userId);
      
      console.log('✅ ML user choice recorded successfully');
    } catch (error) {
      console.error('❌ Failed to record ML user choice:', error);
    }
  }

  private generateBaseRecommendations(
    analysis: PhotoAnalysisResult,
    userId?: string
  ): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // Use style affinities from analysis as base
    const styleAffinities = analysis.styleAffinities || {};
    
    // Convert style affinities to recommendations
    Object.entries(styleAffinities).forEach(([styleIdStr, affinity]) => {
      const styleId = parseInt(styleIdStr);
      if (affinity > 0.3) { // Only include styles with decent affinity
        recommendations.push({
          styleId,
          confidence: affinity,
          reason: this.generateReasonForStyle(styleId, analysis),
          category: affinity > 0.8 ? 'ai-perfect' : affinity > 0.6 ? 'personal' : 'trending',
          metadata: {
            baseAffinity: affinity,
            personalizationBoost: userId ? this.getPersonalizationBoost(styleId, userId) : 0,
            contextualBoost: 0 // Will be applied by ContextualAdjustments
          }
        });
      }
    });

    // If no good recommendations, use fallback
    if (recommendations.length === 0) {
      return this.getFallbackRecommendations(analysis);
    }

    return recommendations;
  }

  private generateReasonForStyle(styleId: number, analysis: PhotoAnalysisResult): string {
    const reasons: { [key: number]: string } = {
      2: analysis.hasPortrait ? 'Perfect for portrait paintings' : 'Classic oil painting style',
      4: 'Beautiful watercolor effects suit your image',
      5: 'Soft pastel tones enhance your photo',
      6: 'Geometric style complements your composition',
      7: 'Animated style brings energy to your image',
      8: 'Artistic charcoal sketch effect',
      9: 'Bold pop art colors make it vibrant',
      10: 'Neon effects create stunning results',
      11: 'Electric colors enhance your photo',
      13: 'Abstract style suits your composition',
      15: 'Luxurious art deco elegance'
    };
    
    return reasons[styleId] || 'Recommended artistic style for your image';
  }

  private getPersonalizationBoost(styleId: number, userId: string): number {
    const userPref = this.userPreferences.get(userId);
    if (!userPref) return 0;
    
    // Boost if user has selected this style before
    if (userPref.favoriteStyles.includes(styleId)) {
      return 0.2;
    }
    
    return 0;
  }

  private updateMLModel(
    styleId: number,
    analysis: PhotoAnalysisResult,
    completed: boolean,
    userId?: string
  ): void {
    // In a real implementation, this would update ML models
    // For now, we'll just log the learning data
    console.log('📈 ML Model Learning:', {
      styleId,
      imageType: analysis.subjectType,
      orientation: analysis.orientation,
      dominantColors: analysis.dominantColors,
      complexity: analysis.complexity,
      completed,
      userId
    });
  }
}
