import { createContext, useContext } from 'react';
import type { useStudioFeedback } from '@/hooks/useStudioFeedback';

type StudioFeedbackApi = ReturnType<typeof useStudioFeedback>;

export type StudioExperienceContextValue = Pick<
  StudioFeedbackApi,
  'showToast' | 'showUpgradeModal' | 'renderFeedback'
>;

const StudioExperienceContext = createContext<StudioExperienceContextValue | null>(null);

export const StudioExperienceProvider = StudioExperienceContext.Provider;

export const useStudioExperienceContext = (): StudioExperienceContextValue => {
  const context = useContext(StudioExperienceContext);
  if (!context) {
    throw new Error('useStudioExperienceContext must be used within a StudioExperienceProvider');
  }
  return context;
};
