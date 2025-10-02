import { createContext, useContext, ReactNode } from 'react';
import { useStepOneExperience, UseStepOneExperience } from './useStepOneExperience';

export const StepOneExperienceContext = createContext<UseStepOneExperience | null>(null);

export function StepOneExperienceProvider({ children }: { children: ReactNode }) {
  const experience = useStepOneExperience();

  return (
    <StepOneExperienceContext.Provider value={experience}>
      {children}
    </StepOneExperienceContext.Provider>
  );
}

export function useStepOneExperienceContext() {
  const context = useContext(StepOneExperienceContext);

  if (!context) {
    throw new Error('useStepOneExperienceContext must be used within StepOneExperienceProvider');
  }

  return context;
}
