
import { ProgressState, ProgressAction } from './types';

export const initialState: ProgressState = {
  currentStep: 1,
  currentSubStep: 'upload',
  completedSteps: [],
  userBehavior: {
    hesitationCount: 0,
    timeOnStep: 0,
    lastInteraction: Date.now(),
    hoverDuration: 0,
    clickPattern: []
  },
  contextualHelp: {
    showTooltip: false,
    tooltipType: '',
    tooltipMessage: '',
    helpLevel: 'minimal'
  },
  socialProof: {
    recentActivity: [
      "Emma just created her Abstract Fusion masterpiece",
      "Marcus completed his Classic Oil portrait", 
      "Sofia selected Pop Art Burst style",
      "David ordered his 24x18 canvas"
    ],
    confidenceScore: 95,
    completionRate: 87,
    liveUserCount: 247,
    recentCompletions: 43
  },
  personalizedMessages: [],
  conversionElements: {
    urgencyMessage: "",
    momentumScore: 0, // Start at 0 instead of inflated value
    personalizationLevel: 'low',
    timeSpentOnPlatform: 0
  },
  aiAnalysis: {
    isAnalyzing: false,
    analysisStage: '',
    imageType: 'unknown',
    recommendedStyles: []
  }
};

export function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'SET_STEP':
      return { 
        ...state, 
        currentStep: action.payload,
        userBehavior: { ...state.userBehavior, lastInteraction: Date.now() },
        // Only add momentum if user has actually progressed
        conversionElements: {
          ...state.conversionElements,
          momentumScore: state.completedSteps.length > 0 ? 
            Math.min(100, state.conversionElements.momentumScore + 10) : 
            state.conversionElements.momentumScore
        }
      };
    case 'SET_SUB_STEP':
      return { 
        ...state, 
        currentSubStep: action.payload,
        userBehavior: { ...state.userBehavior, lastInteraction: Date.now() }
      };
    case 'COMPLETE_STEP':
      // Significant momentum boost for actual step completion
      const newMomentumScore = Math.min(100, state.conversionElements.momentumScore + 25);
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload],
        userBehavior: { ...state.userBehavior, lastInteraction: Date.now() },
        conversionElements: {
          ...state.conversionElements,
          momentumScore: newMomentumScore,
          personalizationLevel: newMomentumScore > 50 ? 'high' : newMomentumScore > 25 ? 'medium' : 'low'
        }
      };
    case 'SHOW_HELP':
      return {
        ...state,
        contextualHelp: {
          showTooltip: true,
          tooltipType: action.payload.type,
          tooltipMessage: action.payload.message,
          helpLevel: action.payload.level || state.contextualHelp.helpLevel
        }
      };
    case 'HIDE_HELP':
      return {
        ...state,
        contextualHelp: { 
          showTooltip: false, 
          tooltipType: '', 
          tooltipMessage: '',
          helpLevel: state.contextualHelp.helpLevel
        }
      };
    case 'UPDATE_BEHAVIOR':
      return {
        ...state,
        userBehavior: { ...state.userBehavior, ...action.payload }
      };
    case 'UPDATE_SOCIAL_PROOF':
      return {
        ...state,
        socialProof: { ...state.socialProof, ...action.payload }
      };
    case 'ADD_PERSONALIZED_MESSAGE':
      return {
        ...state,
        personalizedMessages: [...state.personalizedMessages, action.payload]
      };
    case 'UPDATE_CONVERSION_ELEMENTS':
      return {
        ...state,
        conversionElements: { ...state.conversionElements, ...action.payload }
      };
    case 'START_AI_ANALYSIS':
      return {
        ...state,
        aiAnalysis: {
          ...state.aiAnalysis,
          isAnalyzing: true,
          analysisStage: action.payload.stage
        },
        // Small momentum boost for starting analysis
        conversionElements: {
          ...state.conversionElements,
          momentumScore: Math.min(100, state.conversionElements.momentumScore + 5)
        }
      };
    case 'COMPLETE_AI_ANALYSIS':
      return {
        ...state,
        aiAnalysis: {
          ...state.aiAnalysis,
          isAnalyzing: false,
          analysisStage: '',
          imageType: action.payload.imageType,
          recommendedStyles: action.payload.recommendedStyles
        }
      };
    case 'UPDATE_HELP_LEVEL':
      return {
        ...state,
        contextualHelp: {
          ...state.contextualHelp,
          helpLevel: action.payload
        }
      };
    case 'TRACK_HOVER':
      return {
        ...state,
        userBehavior: {
          ...state.userBehavior,
          hoverDuration: state.userBehavior.hoverDuration + action.payload,
          lastInteraction: Date.now()
        }
      };
    case 'TRACK_CLICK':
      return {
        ...state,
        userBehavior: {
          ...state.userBehavior,
          clickPattern: [...state.userBehavior.clickPattern, action.payload].slice(-10),
          lastInteraction: Date.now()
        }
      };
    default:
      return state;
  }
}
