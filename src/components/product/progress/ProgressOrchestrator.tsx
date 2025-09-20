
import { createContext, useContext, useReducer, ReactNode } from "react";
import { ProgressContextType } from './types';
import { progressReducer, initialState } from './progressReducer';
import { useAIAnalysis } from './hooks/useAIAnalysis';

const ProgressContext = createContext<ProgressContextType | null>(null);

export const ProgressOrchestrator = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  
  // Custom hooks for different concerns
  const { startAIAnalysis, completeAIAnalysis } = useAIAnalysis(dispatch);

  return (
    <ProgressContext.Provider value={{ 
      state, 
      dispatch, 
      startAIAnalysis,
      completeAIAnalysis
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
