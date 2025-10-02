import { useReducer, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type SubStep = 'upload' | 'analyzing' | 'style-selection' | 'complete';
export type AIStatus = 'idle' | 'analyzing' | 'complete';
export type ImageType = 'portrait' | 'landscape' | 'square' | 'unknown';
export type HelpType = 'hesitation' | 'recommendation' | 'social' | 'general';
export type HelpLevel = 'minimal' | 'detailed';

export interface StepOneExperience {
  // Sub-step tracking
  subStep: SubStep;

  // Engagement tracking
  lastInteractionAt: number;

  // AI analysis
  ai: {
    status: AIStatus;
    imageType: ImageType;
  };

  // Contextual help (visibility controlled by DOM events)
  help: {
    isVisible: boolean;
    level: HelpLevel;
    type: HelpType;
    message: string;
  };
}

type ExperienceAction =
  | { type: 'SET_SUB_STEP'; payload: SubStep }
  | { type: 'MARK_INTERACTION' }
  | { type: 'START_AI_ANALYSIS' }
  | { type: 'COMPLETE_AI_ANALYSIS'; payload: { imageType: ImageType } }
  | { type: 'SHOW_HELP'; payload: { type: HelpType; message: string; level: HelpLevel } }
  | { type: 'HIDE_HELP' };

// ============================================================================
// STATIC CONSTANTS (previously in state)
// ============================================================================

export const SOCIAL_PROOF_ACTIVITY = [
  "Emma just created her Abstract Fusion masterpiece",
  "Marcus completed his Classic Oil portrait",
  "Sofia selected Pop Art Burst style",
  "David ordered his 24x18 canvas",
] as const;

export const COMPLETION_RATE = 87;
export const DEFAULT_MOMENTUM_SCORE = 0;

// ============================================================================
// REDUCER
// ============================================================================

const initialState: StepOneExperience = {
  subStep: 'upload',
  lastInteractionAt: Date.now(),
  ai: {
    status: 'idle',
    imageType: 'unknown',
  },
  help: {
    isVisible: false,
    level: 'minimal',
    type: 'general',
    message: '',
  },
};

function experienceReducer(
  state: StepOneExperience,
  action: ExperienceAction
): StepOneExperience {
  switch (action.type) {
    case 'SET_SUB_STEP':
      if (state.subStep === action.payload) {
        return state;
      }
      return {
        ...state,
        subStep: action.payload,
        lastInteractionAt: Date.now(),
      };

    case 'MARK_INTERACTION':
      return {
        ...state,
        lastInteractionAt: Date.now(),
      };

    case 'START_AI_ANALYSIS':
      return {
        ...state,
        ai: {
          ...state.ai,
          status: 'analyzing',
        },
        lastInteractionAt: Date.now(),
      };

    case 'COMPLETE_AI_ANALYSIS':
      return {
        ...state,
        ai: {
          status: 'complete',
          imageType: action.payload.imageType,
        },
        lastInteractionAt: Date.now(),
      };

    case 'SHOW_HELP':
      return {
        ...state,
        help: {
          isVisible: true,
          level: action.payload.level,
          type: action.payload.type,
          message: action.payload.message,
        },
      };

    case 'HIDE_HELP':
      return {
        ...state,
        help: {
          ...state.help,
          isVisible: false,
          type: 'general',
          message: '',
          // Preserve level when hiding (matches legacy behavior)
        },
      };

    default:
      return state;
  }
}

// ============================================================================
// HOOK
// ============================================================================

export function useStepOneExperience() {
  const [state, dispatch] = useReducer(experienceReducer, initialState);

  // Action helpers
  const setSubStep = useCallback((subStep: SubStep) => {
    dispatch({ type: 'SET_SUB_STEP', payload: subStep });
  }, []);

  const markInteraction = useCallback(() => {
    dispatch({ type: 'MARK_INTERACTION' });
  }, []);

  const startAIAnalysis = useCallback(() => {
    dispatch({ type: 'START_AI_ANALYSIS' });
  }, []);

  const completeAIAnalysis = useCallback((imageType: ImageType) => {
    dispatch({ type: 'COMPLETE_AI_ANALYSIS', payload: { imageType } });
  }, []);

  const showHelp = useCallback((type: HelpType, message: string, level: HelpLevel = 'minimal') => {
    dispatch({ type: 'SHOW_HELP', payload: { type, message, level } });
  }, []);

  const hideHelp = useCallback(() => {
    dispatch({ type: 'HIDE_HELP' });
  }, []);

  return {
    // State
    state,

    // Actions
    setSubStep,
    markInteraction,
    startAIAnalysis,
    completeAIAnalysis,
    showHelp,
    hideHelp,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type UseStepOneExperience = ReturnType<typeof useStepOneExperience>;
