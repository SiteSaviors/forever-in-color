
// Re-export types and classes from the refactored modules
export type { UserPreference, SmartRecommendation, ContextualFactors } from './recommendation/types';
export { SmartRecommendationEngine } from './recommendation/SmartRecommendationEngine';

// Create and export a singleton instance
import { SmartRecommendationEngine } from './recommendation/SmartRecommendationEngine';
export const smartRecommendationEngine = new SmartRecommendationEngine();
