
import { memo } from "react";
import { Accordion } from "@/components/ui/accordion";
import StepContainer from "./ActiveStepView/StepContainer";
import StepHeader from "./ActiveStepView/StepHeader";
import StepContent from "./ActiveStepView/StepContent";
import StepFooter from "./ActiveStepView/StepFooter";
import StepActions from "./ActiveStepView/StepActions";

interface ActiveStepViewProps {
  stepNumber: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  onStepClick: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  selectedStyle?: { id: number; name: string } | null;
}

const ActiveStepView = memo(({
  stepNumber,
  title,
  description,
  isActive,
  isCompleted,
  canAccess,
  onStepClick,
  children,
  actions,
  icon,
  className = "",
  selectedStyle
}: ActiveStepViewProps) => {
  return (
    <Accordion type="single" collapsible defaultValue={`step-${stepNumber}`} className={className}>
      <StepContainer 
        stepNumber={stepNumber} 
        isCompleted={isCompleted}
        isActive={isActive}
        canAccess={canAccess}
      >
        <StepHeader
          stepNumber={stepNumber}
          title={title}
          description={description}
          isCompleted={isCompleted}
          isActive={isActive}
          canAccess={canAccess}
          onStepClick={onStepClick}
          selectedStyle={selectedStyle}
        />
        
        <StepContent>
          {children}
        </StepContent>
        
        {actions && (
          <StepFooter>
            <StepActions>
              {actions}
            </StepActions>
          </StepFooter>
        )}
      </StepContainer>
    </Accordion>
  );
});

ActiveStepView.displayName = 'ActiveStepView';

export default ActiveStepView;
