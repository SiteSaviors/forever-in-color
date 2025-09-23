
import { useEffect } from "react";
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";

interface ProgressStateManagerProps {
  currentStep: number;
  completedSteps: number[];
  croppedImage: string | null;
  selectedStyle: { id: number; name: string } | null;
}

const ProgressStateManager = ({
  currentStep,
  completedSteps,
  croppedImage,
  selectedStyle
}: ProgressStateManagerProps) => {
  const { state, dispatch } = useProgressOrchestrator();

  // Update current step immediately when it changes
  useEffect(() => {
    dispatch({ type: 'SET_STEP', payload: currentStep });
  }, [currentStep, dispatch]);

  // Sync completed steps without duplicating entries in the reducer-managed list
  useEffect(() => {
    const orchestratorSteps = new Set(state.completedSteps);
    const uniqueCompletedSteps = new Set(completedSteps);

    uniqueCompletedSteps.forEach(step => {
      if (!orchestratorSteps.has(step)) {
        orchestratorSteps.add(step);
        dispatch({ type: 'COMPLETE_STEP', payload: step });
      }
    });

    // TODO: reinforce this guard inside progressReducer when reducer refactor is scoped.
  }, [completedSteps, state.completedSteps, dispatch]);

  // Update sub-step based on upload/crop progress
  useEffect(() => {
    if (!croppedImage) {
      dispatch({ type: 'SET_SUB_STEP', payload: 'upload' });
    } else if (!selectedStyle || selectedStyle.name === "temp-style") {
      dispatch({ type: 'SET_SUB_STEP', payload: 'style-selection' });
    } else {
      dispatch({ type: 'SET_SUB_STEP', payload: 'complete' });
    }
  }, [croppedImage, selectedStyle, dispatch]);

  return null; // This component only manages state, no UI
};

export default ProgressStateManager;
