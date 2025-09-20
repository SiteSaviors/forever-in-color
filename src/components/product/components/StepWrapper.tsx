
import { memo } from 'react';
import ProductStepContainer from './ProductStepContainer';

interface StepWrapperProps {
  stepNumber: number;
  stepKey: string;
  children: React.ReactNode;
}

const StepWrapper = memo(({ stepNumber, stepKey, children }: StepWrapperProps) => {
  return (
    <ProductStepContainer stepNumber={stepNumber} key={stepKey}>
      {children}
    </ProductStepContainer>
  );
});

StepWrapper.displayName = 'StepWrapper';

export default StepWrapper;
