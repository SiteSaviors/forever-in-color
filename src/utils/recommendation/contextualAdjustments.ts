
import { SmartRecommendation, ContextualFactors } from './types';

export class ContextualAdjustments {
  static applyAdjustments(
    recommendations: SmartRecommendation[],
    factors: ContextualFactors
  ): void {
    // Time-based adjustments
    if (factors.timeOfDay !== undefined) {
      this.applyTimeAdjustments(recommendations, factors.timeOfDay);
    }
    
    // First-time user adjustments
    if (factors.isFirstTime) {
      this.applyFirstTimeAdjustments(recommendations);
    }
    
    // Mobile device adjustments
    if (factors.deviceType === 'mobile') {
      this.applyMobileAdjustments(recommendations);
    }
  }

  private static applyTimeAdjustments(recommendations: SmartRecommendation[], hour: number): void {
    // Evening hours - suggest warmer, more dramatic styles
    if (hour >= 18 || hour <= 6) {
      recommendations.forEach(rec => {
        if ([2, 8, 15].includes(rec.styleId)) { // Classic, Charcoal, Deco
          rec.confidence *= 1.1;
        }
      });
    }
  }

  private static applyFirstTimeAdjustments(recommendations: SmartRecommendation[]): void {
    recommendations.forEach(rec => {
      if (rec.category === 'ai-perfect') {
        rec.confidence *= 1.2; // Boost AI recommendations for new users
        if (rec.urgency) rec.urgency = 'high';
      }
    });
  }

  private static applyMobileAdjustments(recommendations: SmartRecommendation[]): void {
    // Boost simpler, more mobile-friendly styles
    recommendations.forEach(rec => {
      if ([5, 7, 10].includes(rec.styleId)) { // Pastel, 3D, Neon
        rec.confidence *= 1.05;
      }
    });
  }
}
