
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
    clickPattern: [],
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
  personalizedMessages: [],
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
    case 'SHOW_HELP':
      return {
        ...state,
        contextualHelp: {
          showTooltip: true,
          tooltipType: action.payload.type,
          tooltipMessage: action.payload.message,
          helpLevel: action.payload.level || state.contextualHelp.helpLevel,
        },
      };
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
    case 'UPDATE_SOCIAL_PROOF':
      return {
        ...state,
        socialProof: {
          ...state.socialProof,
          ...action.payload,
        },
      };
    case 'ADD_PERSONALIZED_MESSAGE':
      return {
        ...state,
        personalizedMessages: [...state.personalizedMessages, action.payload],
      };
    case 'UPDATE_CONVERSION_ELEMENTS':
      return {
        ...state,
        conversionElements: {
          ...state.conversionElements,
          ...action.payload,
        },
      };
    case 'UPDATE_HELP_LEVEL':
      if (state.contextualHelp.helpLevel === action.payload) {
        return state;
      }
      return {
        ...state,
        contextualHelp: {
          ...state.contextualHelp,
          helpLevel: action.payload,
        },
      };
    case 'TRACK_HOVER':
      return {
        ...state,
        userBehavior: {
          ...state.userBehavior,
          hoverDuration: state.userBehavior.hoverDuration + action.payload,
          lastInteraction: Date.now(),
        },
      };
    case 'TRACK_CLICK':
      return {
        ...state,
        userBehavior: {
          ...state.userBehavior,
          clickPattern: [...state.userBehavior.clickPattern, action.payload].slice(-10),
          lastInteraction: Date.now(),
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
    personalizedMessages: state.personalizedMessages,
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
