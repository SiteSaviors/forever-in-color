import { useMemo } from 'react';
import {
  useProgressSliceContext,
  useEngagementSliceContext,
  useAIInsightsSliceContext,
} from '../ProgressSlices';

export const useCurrentStep = () => {
  const { state } = useProgressSliceContext();
  return state.currentStep;
};

export const useCurrentSubStep = () => {
  const { state } = useProgressSliceContext();
  return state.currentSubStep;
};

export const useCompletedSteps = () => {
  const { state } = useProgressSliceContext();
  return state.completedSteps;
};

export const useProgressDispatch = () => {
  const { dispatch } = useProgressSliceContext();
  return dispatch;
};

export const useUserBehavior = () => {
  const { state } = useEngagementSliceContext();
  return state.userBehavior;
};

export const useTooltip = () => {
  const { state } = useEngagementSliceContext();
  return state.contextualHelp;
};

export const useSocialProof = () => {
  const { state } = useEngagementSliceContext();
  return state.socialProof;
};

export const useConversionElements = () => {
  const { state } = useEngagementSliceContext();
  return state.conversionElements;
};

export const useAIStatus = () => {
  const { state } = useAIInsightsSliceContext();
  return state.aiAnalysis;
};

export const useAIHelpers = () => {
  const { startAIAnalysis, completeAIAnalysis } = useAIInsightsSliceContext();
  return useMemo(
    () => ({ startAIAnalysis, completeAIAnalysis }),
    [completeAIAnalysis, startAIAnalysis]
  );
};
