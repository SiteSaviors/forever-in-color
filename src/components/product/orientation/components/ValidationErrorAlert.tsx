
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ValidationErrorAlertProps {
  validationError: string | null;
}

const ValidationErrorAlert = ({ validationError }: ValidationErrorAlertProps) => {
  if (!validationError) return null;

  return (
    <Alert className="border-red-200 bg-red-50 animate-in fade-in duration-300">
      <AlertDescription className="text-red-800 font-medium">
        {validationError}
      </AlertDescription>
    </Alert>
  );
};

export default ValidationErrorAlert;
