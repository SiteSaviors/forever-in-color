
import { memo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StepValidatorProps {
  stepNumber: number;
  isValid: boolean;
  validationMessage?: string;
  children: React.ReactNode;
}

const StepValidator = memo(({
  stepNumber,
  isValid,
  validationMessage,
  children
}: StepValidatorProps) => {
  if (!isValid && validationMessage) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Step {stepNumber}: {validationMessage}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
});

StepValidator.displayName = 'StepValidator';

export default StepValidator;
