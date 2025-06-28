
export interface ProgressActionPayload {
  step?: number;
  subStep?: string;
  type?: string;
  message?: string;
  level?: 'minimal' | 'moderate' | 'detailed';
  stage?: string;
  imageType?: string;
  recommendations?: number[];
  duration?: number;
  element?: string;
  [key: string]: unknown;
}

export interface UserBehaviorData {
  hesitationCount: number;
  timeOnStep: number;
  lastInteraction: number;
  hoverDuration: number;
  clickPattern: string[];
}

export interface ContextualHelpData {
  showTooltip: boolean;
  tooltipType: string;
  tooltipMessage: string;
  helpLevel: 'minimal' | 'moderate' | 'detailed';
}

export interface SocialProofData {
  recentActivity: string[];
  confidenceScore: number;
  completionRate: number;
  liveUserCount: number;
  recentCompletions: number;
}

export interface ConversionElementsData {
  urgencyMessage: string;
  momentumScore: number;
  personalizationLevel: 'low' | 'medium' | 'high';
  timeSpentOnPlatform: number;
}

export interface AIAnalysisData {
  isAnalyzing: boolean;
  analysisStage: string;
  imageType: 'portrait' | 'landscape' | 'square' | 'unknown';
  recommendedStyles: number[];
}
