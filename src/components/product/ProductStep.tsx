
import React from "react";
import CompletedStepView from "./components/CompletedStepView";
import ActiveStepView from "./components/ActiveStepView";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingState from "./components/LoadingState";

interface ProductStepProps {
  stepNumber: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  onStepClick: () => void;
  selectedStyle?: { id: number; name: string } | null;
  children: React.ReactNode;
  completedPreview?: React.ReactNode;
}

const ProductStep = ({ 
  stepNumber,
  title,
  description,
  isActive, 
  isCompleted, 
  canAccess,
  onStepClick,
  selectedStyle, 
  children,
  completedPreview
}: ProductStepProps) => {
  
  // Add loading state for initial render
  if (typeof stepNumber !== 'number' || !title) {
    return <LoadingState message="Loading step..." />;
  }

  return (
    <ErrorBoundary>
      {/* Render completed step in collapsed state when not active */}
      {isCompleted && !isActive ? (
        <CompletedStepView
          stepNumber={stepNumber}
          title={title}
          selectedStyle={selectedStyle}
          completedPreview={completedPreview}
          onStepClick={onStepClick}
        />
      ) : (
        <ActiveStepView
          stepNumber={stepNumber}
          title={title}
          description={description}
          isActive={isActive}
          isCompleted={isCompleted}
          canAccess={canAccess}
          onStepClick={onStepClick}
          selectedStyle={selectedStyle}
        >
          {children}
        </ActiveStepView>
      )}
    </ErrorBoundary>
  );
};

export default ProductStep;
