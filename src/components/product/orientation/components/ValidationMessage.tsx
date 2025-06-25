
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { ValidationResult } from "../utils/validationUtils";

interface ValidationMessageProps {
  validation: ValidationResult;
  className?: string;
}

const ValidationMessage = ({ validation, className = "" }: ValidationMessageProps) => {
  if (validation.isValid && validation.warnings.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Error Messages */}
      {validation.errors.map((error, index) => (
        <Alert key={`error-${index}`} className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      ))}
      
      {/* Warning Messages */}
      {validation.warnings.map((warning, index) => (
        <Alert key={`warning-${index}`} className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {warning}
          </AlertDescription>
        </Alert>
      ))}
      
      {/* Success Message */}
      {validation.isValid && validation.warnings.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Selection is valid! You can proceed to the next step.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ValidationMessage;
