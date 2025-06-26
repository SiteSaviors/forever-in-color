

// Re-export types and classes from the refactored modules
export type { UserPreference, SmartRecommendation, ContextualFactors } from './recommendation/types';
export { SmartRecommendationEngine } from './recommendation/SmartRecommendationEngine';

// Create and export a singleton instance
export const smartRecommendationEngine = new SmartRecommendationEngine();

