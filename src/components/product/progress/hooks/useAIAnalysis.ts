
import { useCallback } from 'react';
import { ProgressAction } from '../types';

export const useAIAnalysis = (dispatch: React.Dispatch<ProgressAction>) => {
  const startAIAnalysis = useCallback((stage: string) => {
    dispatch({ type: 'START_AI_ANALYSIS', payload: { stage } });
  }, [dispatch]);

  const completeAIAnalysis = useCallback((imageType: string, recommendations: number[]) => {
    dispatch({ type: 'COMPLETE_AI_ANALYSIS', payload: { imageType, recommendedStyles: recommendations } });
  }, [dispatch]);

  return { startAIAnalysis, completeAIAnalysis };
};
