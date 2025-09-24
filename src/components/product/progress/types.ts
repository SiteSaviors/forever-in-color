
export interface ProgressState {
  currentStep: number;
  currentSubStep: string;
  completedSteps: number[];
  userBehavior: {
    hesitationCount: number;
    timeOnStep: number;
    lastInteraction: number;
    hoverDuration: number;
    clickPattern: string[];
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
  personalizedMessages: string[];
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

export type EngagementSliceState = Pick<ProgressState, 'userBehavior' | 'contextualHelp' | 'socialProof' | 'personalizedMessages' | 'conversionElements'>;

export type AIInsightsSliceState = Pick<ProgressState, 'aiAnalysis'>;

export interface ProgressAction {
  type: 'SET_STEP' | 'SET_SUB_STEP' | 'COMPLETE_STEP' | 'SHOW_HELP' | 'HIDE_HELP' | 
        'UPDATE_BEHAVIOR' | 'UPDATE_SOCIAL_PROOF' | 'ADD_PERSONALIZED_MESSAGE' |
        'UPDATE_CONVERSION_ELEMENTS' | 'START_AI_ANALYSIS' | 'COMPLETE_AI_ANALYSIS' |
        'UPDATE_HELP_LEVEL' | 'TRACK_HOVER' | 'TRACK_CLICK';
  payload: any;
}

export interface ProgressContextType {
  state: ProgressState;
  dispatch: React.Dispatch<ProgressAction>;
  startAIAnalysis: (stage: string) => void;
  completeAIAnalysis: (imageType: string, recommendations: number[]) => void;
}
