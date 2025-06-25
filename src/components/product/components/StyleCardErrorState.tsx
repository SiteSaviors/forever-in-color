
import { RefreshCw, AlertTriangle, Wifi, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StyleCardErrorStateProps {
  error: string;
  styleName: string;
  onRetry: () => void;
  onSkip?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

const StyleCardErrorState = ({ 
  error, 
  styleName, 
  onRetry, 
  onSkip,
  retryCount = 0,
  maxRetries = 3
}: StyleCardErrorStateProps) => {
  // Determine error type and appropriate messaging
  const getErrorInfo = () => {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('rate limit') || errorLower.includes('429')) {
      return {
        icon: Clock,
        title: "Service Busy",
        message: "Our AI is experiencing high demand. Please wait a moment and try again.",
        canRetry: true,
        retryDelay: "Please wait 30 seconds before retrying"
      };
    }
    
    if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('connection')) {
      return {
        icon: Wifi,
        title: "Connection Issue",
        message: "Check your internet connection and try again.",
        canRetry: true,
        retryDelay: null
      };
    }
    
    if (errorLower.includes('service unavailable') || errorLower.includes('503')) {
      return {
        icon: AlertTriangle,
        title: "Service Temporarily Down",
        message: "Our AI service is temporarily unavailable. Please try again in a few minutes.",
        canRetry: true,
        retryDelay: "Try again in 2-3 minutes"
      };
    }
    
    if (errorLower.includes('invalid') || errorLower.includes('400')) {
      return {
        icon: AlertTriangle,
        title: "Image Processing Error",
        message: "There was an issue processing your image. Try uploading a different photo.",
        canRetry: false,
        retryDelay: null
      };
    }
    
    // Generic error
    return {
      icon: AlertTriangle,
      title: "Generation Failed",
      message: "Something went wrong while creating your preview. Please try again.",
      canRetry: true,
      retryDelay: null
    };
  };

  const errorInfo = getErrorInfo();
  const Icon = errorInfo.icon;
  const hasRetriesLeft = retryCount < maxRetries;
  const canRetry = errorInfo.canRetry && hasRetriesLeft;

  return (
    <div className="absolute inset-0 bg-red-50/95 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg p-4">
      <div className="text-center max-w-xs">
        <Icon className="w-8 h-8 mx-auto text-red-500 mb-3" />
        
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertDescription className="text-sm text-red-700">
            <div className="font-semibold mb-1">{errorInfo.title}</div>
            <div>{errorInfo.message}</div>
            {errorInfo.retryDelay && (
              <div className="text-xs mt-2 text-red-600">{errorInfo.retryDelay}</div>
            )}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          {canRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="w-full text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Try Again ({maxRetries - retryCount} left)
            </Button>
          )}
          
          {onSkip && (
            <Button
              onClick={onSkip}
              size="sm"
              variant="ghost"
              className="w-full text-gray-600 hover:bg-gray-100"
            >
              Skip for Now
            </Button>
          )}
          
          {!canRetry && !hasRetriesLeft && (
            <div className="text-xs text-gray-500 mt-2">
              Maximum retries reached. Please try a different image.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleCardErrorState;
