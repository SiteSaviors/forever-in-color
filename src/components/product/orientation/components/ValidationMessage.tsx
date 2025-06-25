
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ValidationError {
  field: 'orientation' | 'size' | 'general';
  message: string;
  type: 'error' | 'warning';
}

interface ValidationMessageProps {
  errors: ValidationError[];
  showErrors: boolean;
  className?: string;
}

const ValidationMessage = ({ errors, showErrors, className = "" }: ValidationMessageProps) => {
  if (!showErrors || errors.length === 0) {
    return null;
  }

  const errorMessages = errors.filter(error => error.type === 'error');
  const warningMessages = errors.filter(error => error.type === 'warning');

  return (
    <div className={`space-y-2 ${className}`} role="alert" aria-live="polite">
      {/* Error Messages */}
      {errorMessages.map((error, index) => (
        <Alert key={`error-${index}`} className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error:</strong> {error.message}
          </AlertDescription>
        </Alert>
      ))}
      
      {/* Warning Messages */}
      {warningMessages.map((warning, index) => (
        <Alert key={`warning-${index}`} className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Note:</strong> {warning.message}
          </AlertDescription>
        </Alert>
      ))}
      
      {/* Success Message */}
      {errorMessages.length === 0 && warningMessages.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your selection is valid! You can proceed to the next step.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ValidationMessage;
