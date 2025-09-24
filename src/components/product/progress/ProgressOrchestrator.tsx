
import { ReactNode, useMemo, useReducer } from "react";
import { ProgressContextType, ProgressState } from './types';
import { progressReducer, initialState } from './progressReducer';
import { useAIAnalysis } from './hooks/useAIAnalysis';
import {
  ProgressSliceProvider,
  EngagementSliceProvider,
  AIInsightsSliceProvider,
  useProgressSliceContext,
  useEngagementSliceContext,
  useAIInsightsSliceContext,
} from './ProgressSlices';

export const ProgressOrchestrator = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const { startAIAnalysis, completeAIAnalysis } = useAIAnalysis(dispatch);

  return (
    <ProgressSliceProvider state={state} dispatch={dispatch}>
      <EngagementSliceProvider state={state} dispatch={dispatch}>
        <AIInsightsSliceProvider
          state={state}
          dispatch={dispatch}
          startAIAnalysis={startAIAnalysis}
          completeAIAnalysis={completeAIAnalysis}
        >
          {children}
        </AIInsightsSliceProvider>
      </EngagementSliceProvider>
    </ProgressSliceProvider>
  );
};

export const useProgressOrchestrator = (): ProgressContextType => {
  const { state: progressState, dispatch } = useProgressSliceContext();
  const { state: engagementState } = useEngagementSliceContext();
  const {
    state: aiInsightsState,
    startAIAnalysis,
    completeAIAnalysis,
  } = useAIInsightsSliceContext();

  const combinedState = useMemo<ProgressState>(
    () => ({
      ...progressState,
      ...engagementState,
      ...aiInsightsState,
    }),
    [aiInsightsState, engagementState, progressState]
  );

  return useMemo<ProgressContextType>(
    () => ({
      state: combinedState,
      dispatch,
      startAIAnalysis,
      completeAIAnalysis,
    }),
    [combinedState, completeAIAnalysis, dispatch, startAIAnalysis]
  );
};
