
export interface ProgressState {
  currentStep: number;
  currentSubStep: string;
  completedSteps: number[];
  userBehavior: {
    hesitationCount: number;
    timeOnStep: number;
    lastInteraction: number;
    hoverDuration: number;
  };
  contextualHelp: {
    showTooltip: boolean;
    tooltipType: string;
    tooltipMessage: string;
    helpLevel: 'minimal' | 'moderate' | 'detailed';
  };
  socialProof: {
    recentActivity: string[];
    confidenceScore: number;
    completionRate: number;
    liveUserCount: number;
    recentCompletions: number;
  };
  conversionElements: {
    urgencyMessage: string;
    momentumScore: number;
    personalizationLevel: 'low' | 'medium' | 'high';
    timeSpentOnPlatform: number;
  };
  aiAnalysis: {
    isAnalyzing: boolean;
    analysisStage: string;
    imageType: 'portrait' | 'landscape' | 'square' | 'unknown';
    recommendedStyles: number[];
  };
}

export type ProgressSliceState = Pick<ProgressState, 'currentStep' | 'currentSubStep' | 'completedSteps'>;

export type EngagementSliceState = Pick<ProgressState, 'userBehavior' | 'contextualHelp' | 'socialProof' | 'conversionElements'>;

export type AIInsightsSliceState = Pick<ProgressState, 'aiAnalysis'>;

export interface ProgressAction {
  type: 'SET_STEP' | 'SET_SUB_STEP' | 'COMPLETE_STEP' | 'HIDE_HELP' | 
        'UPDATE_BEHAVIOR' | 'ADD_PERSONALIZED_MESSAGE' |
        'START_AI_ANALYSIS' | 'COMPLETE_AI_ANALYSIS';
  payload: any;
}

export interface ProgressContextType {
  state: ProgressState;
  dispatch: React.Dispatch<ProgressAction>;
  startAIAnalysis: (stage: string) => void;
  completeAIAnalysis: (imageType: string, recommendations: number[]) => void;
}
