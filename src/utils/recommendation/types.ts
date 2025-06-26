
export interface SmartRecommendation {
  styleId: number;
  confidence: number; // 0-1 ML confidence score
  reason: string; // Human-readable explanation
  category: 'ai-perfect' | 'personal' | 'trending' | 'discovery';
  urgency?: 'high' | 'medium' | 'low';
  metadata?: {
    baseAffinity?: number;
    personalizationBoost?: number;
    trendingBoost?: number;
    contextualBoost?: number;
    realTimeBoost?: number;
    discoveryBoost?: number;
  };
}

export interface ContextualFactors {
  timeOfDay: number; // 0-23 hour
  isFirstTime: boolean;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  connectionQuality?: 'slow' | 'medium' | 'fast';
  sessionDuration?: number; // milliseconds
  previousStyles?: number[]; // previously selected styles
}

export interface UserPreference {
  styleId: number;
  frequency: number;
  satisfaction: number; // 0-1
  context: {
    imageType: 'portrait' | 'landscape' | 'object' | 'abstract';
    orientation: 'vertical' | 'horizontal' | 'square';
    timeOfDay: number;
  };
  favoriteStyles: number[];
  colorPreferences: string[];
  complexityPreference: 'simple' | 'moderate' | 'complex';
  orientationPreference: 'vertical' | 'horizontal' | 'square';
  lastInteraction: number; // timestamp
  totalInteractions: number;
  completionRate: number; // 0-1
}

export interface RecommendationGeneratorParams {
  analysis: import('../photoAnalysis/types').PhotoAnalysisResult;
  userPreferences: UserPreference[];
  contextualFactors: ContextualFactors;
}

export interface RecommendationMetrics {
  clickThroughRate: number;
  conversionRate: number;
  userSatisfactionScore: number; // 1-5
  averageProcessingTime: number;
  cacheUtilization: number;
}

export interface TrendingData {
  styleId: number;
  trendScore: number; // composite trending score
  recentSelections: number; // last 24h
  velocityChange: number; // rate of change
  socialShares: number;
  completionRate: number;
}

export interface UserBehaviorInsight {
  preferredTimeSlots: number[]; // hours when user is most active
  devicePreferences: string[];
  styleProgression: number[]; // styles in order of discovery
  engagementLevel: 'low' | 'medium' | 'high';
  churnRisk: number; // 0-1 probability of churning
}
