
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
  isCompleted: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const ActiveStepView = memo(({
  stepNumber,
  title,
  description,
  isCompleted,
  children,
  actions,
  icon,
  className = ""
}: ActiveStepViewProps) => {
  return (
    <Accordion type="single" collapsible defaultValue={`step-${stepNumber}`} className={className}>
      <StepContainer stepNumber={stepNumber} isCompleted={isCompleted}>
        <StepHeader
          stepNumber={stepNumber}
          title={title}
          description={description}
          isCompleted={isCompleted}
          icon={icon}
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
