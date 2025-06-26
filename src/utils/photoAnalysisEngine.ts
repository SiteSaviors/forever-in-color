

// Re-export types and classes from the refactored modules
export type { PhotoAnalysisResult } from './photoAnalysis/types';
export { PhotoAnalysisEngine } from './photoAnalysis/PhotoAnalysisEngine';

// Create and export a singleton instance
export const photoAnalysisEngine = new PhotoAnalysisEngine();

