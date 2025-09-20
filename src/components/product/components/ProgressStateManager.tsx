
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
  const { dispatch } = useProgressOrchestrator();

  // Update progress orchestrator state
  useEffect(() => {
    dispatch({ type: 'SET_STEP', payload: currentStep });
    completedSteps.forEach(step => {
      dispatch({ type: 'COMPLETE_STEP', payload: step });
    });
  }, [currentStep, completedSteps, dispatch]);

  // Update sub-step based on progress
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
