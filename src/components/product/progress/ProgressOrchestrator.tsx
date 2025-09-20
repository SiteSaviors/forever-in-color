
import { createContext, useContext, useReducer, ReactNode } from "react";
import { ProgressContextType } from './types';
import { progressReducer, initialState } from './progressReducer';
import { useHapticFeedback } from './hooks/useHapticFeedback';
import { useContextualHelp } from './hooks/useContextualHelp';
import { useAIAnalysis } from './hooks/useAIAnalysis';
import { useBehaviorTracking } from './hooks/useBehaviorTracking';
import { useProgressEffects } from './hooks/useProgressEffects';

const ProgressContext = createContext<ProgressContextType | null>(null);

export const ProgressOrchestrator = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  
  // Custom hooks for different concerns
  const { triggerHaptic } = useHapticFeedback(state);
  const { showContextualHelp, hideContextualHelp } = useContextualHelp(dispatch);
  const { startAIAnalysis, completeAIAnalysis } = useAIAnalysis(dispatch);
  const { trackHover, trackClick } = useBehaviorTracking(dispatch);

  // Effects for automatic behaviors
  useProgressEffects(state, dispatch, showContextualHelp);

  return (
    <ProgressContext.Provider value={{ 
      state, 
      dispatch, 
      triggerHaptic, 
      showContextualHelp, 
      hideContextualHelp,
      startAIAnalysis,
      completeAIAnalysis,
      trackHover,
      trackClick
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgressOrchestrator = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgressOrchestrator must be used within ProgressOrchestrator');
  }
  return context;
};
