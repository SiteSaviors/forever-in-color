
import { PhotoAnalysisResult } from '../photoAnalysisEngine';

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

export interface ContextualFactors {
  timeOfDay?: number;
  isFirstTime?: boolean;
  deviceType?: 'mobile' | 'desktop';
}

export interface SessionContext {
  startTime: number;
  interactions: number;
  previousSelections: number[];
}

export interface RecommendationGeneratorParams {
  analysis: PhotoAnalysisResult;
  userPreferences: UserPreference[];
  globalTrends: Map<number, number>;
  sessionContext: SessionContext;
}
