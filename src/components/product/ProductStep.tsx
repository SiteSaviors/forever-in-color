
import CompletedStepView from "./components/CompletedStepView";
import ActiveStepView from "./components/ActiveStepView";

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
  
  // Render completed step in collapsed state when not active
  if (isCompleted && !isActive) {
    return (
      <CompletedStepView
        stepNumber={stepNumber}
        title={title}
        selectedStyle={selectedStyle}
        completedPreview={completedPreview}
        onStepClick={onStepClick}
      />
    );
  }

  return (
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
  );
};

export default ProductStep;
