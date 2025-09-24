import { createContext, useContext, ReactNode, useMemo, Dispatch } from 'react';
import type { ProgressAction, ProgressState, ProgressSliceState, EngagementSliceState, AIInsightsSliceState } from './types';

type ProgressSliceContextValue = {
  state: ProgressSliceState;
  dispatch: Dispatch<ProgressAction>;
};

type EngagementSliceContextValue = {
  state: EngagementSliceState;
  dispatch: Dispatch<ProgressAction>;
};

type AIInsightsSliceContextValue = {
  state: AIInsightsSliceState;
  dispatch: Dispatch<ProgressAction>;
  startAIAnalysis: (stage: string) => void;
  completeAIAnalysis: (imageType: string, recommendations: number[]) => void;
};

const ProgressSliceContext = createContext<ProgressSliceContextValue | null>(null);
const EngagementSliceContext = createContext<EngagementSliceContextValue | null>(null);
const AIInsightsSliceContext = createContext<AIInsightsSliceContextValue | null>(null);

interface BaseSliceProviderProps {
  state: ProgressState;
  dispatch: Dispatch<ProgressAction>;
  children: ReactNode;
}

interface AIInsightsSliceProviderProps extends BaseSliceProviderProps {
  startAIAnalysis: (stage: string) => void;
  completeAIAnalysis: (imageType: string, recommendations: number[]) => void;
}

export const ProgressSliceProvider = ({ state, dispatch, children }: BaseSliceProviderProps) => {
  const sliceState = useMemo<ProgressSliceState>(
    () => ({
      currentStep: state.currentStep,
      currentSubStep: state.currentSubStep,
      completedSteps: state.completedSteps,
    }),
    [state.completedSteps, state.currentStep, state.currentSubStep]
  );

  const contextValue = useMemo<ProgressSliceContextValue>(
    () => ({
      state: sliceState,
      dispatch,
    }),
    [dispatch, sliceState]
  );

  return (
    <ProgressSliceContext.Provider value={contextValue}>
      {children}
    </ProgressSliceContext.Provider>
  );
};

export const EngagementSliceProvider = ({ state, dispatch, children }: BaseSliceProviderProps) => {
  const sliceState = useMemo<EngagementSliceState>(
    () => ({
      userBehavior: state.userBehavior,
      contextualHelp: state.contextualHelp,
      socialProof: state.socialProof,
      personalizedMessages: state.personalizedMessages,
      conversionElements: state.conversionElements,
    }),
    [
      state.contextualHelp,
      state.conversionElements,
      state.personalizedMessages,
      state.socialProof,
      state.userBehavior,
    ]
  );

  const contextValue = useMemo<EngagementSliceContextValue>(
    () => ({
      state: sliceState,
      dispatch,
    }),
    [dispatch, sliceState]
  );

  return (
    <EngagementSliceContext.Provider value={contextValue}>
      {children}
    </EngagementSliceContext.Provider>
  );
};

export const AIInsightsSliceProvider = ({
  state,
  dispatch,
  startAIAnalysis,
  completeAIAnalysis,
  children,
}: AIInsightsSliceProviderProps) => {
  const sliceState = useMemo<AIInsightsSliceState>(
    () => ({
      aiAnalysis: state.aiAnalysis,
    }),
    [state.aiAnalysis]
  );

  const contextValue = useMemo<AIInsightsSliceContextValue>(
    () => ({
      state: sliceState,
      dispatch,
      startAIAnalysis,
      completeAIAnalysis,
    }),
    [completeAIAnalysis, dispatch, sliceState, startAIAnalysis]
  );

  return (
    <AIInsightsSliceContext.Provider value={contextValue}>
      {children}
    </AIInsightsSliceContext.Provider>
  );
};

export const useProgressSliceContext = () => {
  const context = useContext(ProgressSliceContext);
  if (!context) {
    throw new Error('useProgressSliceContext must be used within ProgressOrchestrator');
  }
  return context;
};

export const useEngagementSliceContext = () => {
  const context = useContext(EngagementSliceContext);
  if (!context) {
    throw new Error('useEngagementSliceContext must be used within ProgressOrchestrator');
  }
  return context;
};

export const useAIInsightsSliceContext = () => {
  const context = useContext(AIInsightsSliceContext);
  if (!context) {
    throw new Error('useAIInsightsSliceContext must be used within ProgressOrchestrator');
  }
  return context;
};
