
import { ProgressState, ProgressAction, ProgressSliceState, EngagementSliceState, AIInsightsSliceState } from './types';

const initialProgressSlice: ProgressSliceState = {
  currentStep: 1,
  currentSubStep: 'upload',
  completedSteps: [],
};

const initialEngagementSlice: EngagementSliceState = {
  userBehavior: {
    hesitationCount: 0,
    timeOnStep: 0,
    lastInteraction: Date.now(),
    hoverDuration: 0,
  },
  contextualHelp: {
    showTooltip: false,
    tooltipType: '',
    tooltipMessage: '',
    helpLevel: 'minimal',
  },
  socialProof: {
    recentActivity: [
      "Emma just created her Abstract Fusion masterpiece",
      "Marcus completed his Classic Oil portrait",
      "Sofia selected Pop Art Burst style",
      "David ordered his 24x18 canvas",
    ],
    confidenceScore: 95,
    completionRate: 87,
    liveUserCount: 247,
    recentCompletions: 43,
  },
  conversionElements: {
    urgencyMessage: '',
    momentumScore: 0,
    personalizationLevel: 'low',
    timeSpentOnPlatform: 0,
  },
};

const initialAIInsightsSlice: AIInsightsSliceState = {
  aiAnalysis: {
    isAnalyzing: false,
    analysisStage: '',
    imageType: 'unknown',
    recommendedStyles: [],
  },
};

export const initialState: ProgressState = {
  ...initialProgressSlice,
  ...initialEngagementSlice,
  ...initialAIInsightsSlice,
};

const progressFlowReducer = (state: ProgressSliceState, action: ProgressAction): ProgressSliceState => {
  switch (action.type) {
    case 'SET_STEP':
      if (state.currentStep === action.payload) {
        return state;
      }
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'SET_SUB_STEP':
      if (state.currentSubStep === action.payload) {
        return state;
      }
      return {
        ...state,
        currentSubStep: action.payload,
      };
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload],
      };
    default:
      return state;
  }
};

const withInteractionUpdate = (state: EngagementSliceState): EngagementSliceState => ({
  ...state,
  userBehavior: {
    ...state.userBehavior,
    lastInteraction: Date.now(),
  },
});

const engagementReducer = (state: EngagementSliceState, action: ProgressAction): EngagementSliceState => {
  switch (action.type) {
    case 'SET_STEP':
    case 'SET_SUB_STEP':
    case 'COMPLETE_STEP':
      return withInteractionUpdate(state);
    case 'HIDE_HELP':
      return {
        ...state,
        contextualHelp: {
          showTooltip: false,
          tooltipType: '',
          tooltipMessage: '',
          helpLevel: state.contextualHelp.helpLevel,
        },
      };
    case 'UPDATE_BEHAVIOR':
      return {
        ...state,
        userBehavior: {
          ...state.userBehavior,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

const aiInsightsReducer = (state: AIInsightsSliceState, action: ProgressAction): AIInsightsSliceState => {
  switch (action.type) {
    case 'START_AI_ANALYSIS':
      return {
        aiAnalysis: {
          ...state.aiAnalysis,
          isAnalyzing: true,
          analysisStage: action.payload.stage,
        },
      };
    case 'COMPLETE_AI_ANALYSIS':
      return {
        aiAnalysis: {
          ...state.aiAnalysis,
          isAnalyzing: false,
          analysisStage: '',
          imageType: action.payload.imageType,
          recommendedStyles: action.payload.recommendedStyles,
        },
      };
    default:
      return state;
  }
};

export function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  const progressSliceState: ProgressSliceState = {
    currentStep: state.currentStep,
    currentSubStep: state.currentSubStep,
    completedSteps: state.completedSteps,
  };

  const engagementSliceState: EngagementSliceState = {
    userBehavior: state.userBehavior,
    contextualHelp: state.contextualHelp,
    socialProof: state.socialProof,
    conversionElements: state.conversionElements,
  };

  const aiInsightsSliceState: AIInsightsSliceState = {
    aiAnalysis: state.aiAnalysis,
  };

  const nextProgressSlice = progressFlowReducer(progressSliceState, action);
  const nextEngagementSlice = engagementReducer(engagementSliceState, action);
  const nextAIInsightsSlice = aiInsightsReducer(aiInsightsSliceState, action);

  if (
    nextProgressSlice === progressSliceState &&
    nextEngagementSlice === engagementSliceState &&
    nextAIInsightsSlice === aiInsightsSliceState
  ) {
    return state;
  }

  return {
    ...state,
    ...nextProgressSlice,
    ...nextEngagementSlice,
    ...nextAIInsightsSlice,
  };
}
