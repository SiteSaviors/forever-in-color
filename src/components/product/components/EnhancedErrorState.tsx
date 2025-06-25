
import { AlertTriangle, RotateCcw, SkipForward, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedErrorStateProps {
  error: string;
  onRetry?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  retryCount?: number;
  maxRetries?: number;
  context?: string;
}

/**
 * EnhancedErrorState Component
 * 
 * Provides user-friendly error messages with actionable recovery options.
 * Adapts messaging based on error type and retry attempts.
 */
const EnhancedErrorState = ({
  error,
  onRetry,
  onSkip,
  showSkip = false,
  retryCount = 0,
  maxRetries = 3,
  context = "operation"
}: EnhancedErrorStateProps) => {
  
  // Determine error type and appropriate messaging
  const getErrorInfo = () => {
    const lowerError = error.toLowerCase();
    
    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return {
        icon: WifiOff,
        title: "Connection Issue",
        message: "Please check your internet connection and try again.",
        actionText: "Retry Connection"
      };
    }
    
    if (lowerError.includes('timeout') || lowerError.includes('took too long')) {
      return {
        icon: WifiOff,
        title: "Request Timeout",
        message: "The request is taking longer than expected. This might be due to high server load.",
        actionText: "Try Again"
      };
    }
    
    if (lowerError.includes('rate limit') || lowerError.includes('too many requests')) {
      return {
        icon: AlertTriangle,
        title: "Too Many Requests",
        message: "Please wait a moment before trying again.",
        actionText: "Wait & Retry"
      };
    }
    
    if (lowerError.includes('service unavailable') || lowerError.includes('503')) {
      return {
        icon: AlertTriangle,
        title: "Service Temporarily Unavailable",
        message: "Our servers are experiencing high demand. Please try again in a few moments.",
        actionText: "Retry"
      };
    }
    
    // Generic error
    return {
      icon: AlertTriangle,
      title: "Something Went Wrong",
      message: `We encountered an issue with your ${context}. Don't worry, this happens sometimes.`,
      actionText: "Try Again"
    };
  };

  const errorInfo = getErrorInfo();
  const IconComponent = errorInfo.icon;
  const canRetry = onRetry && retryCount < maxRetries;
  const hasReachedMaxRetries = retryCount >= maxRetries;

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full">
        <IconComponent className="w-8 h-8 text-red-500" />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">{errorInfo.title}</h3>
        <p className="text-sm text-gray-600 max-w-sm">
          {errorInfo.message}
        </p>
        
        {retryCount > 0 && (
          <p className="text-xs text-gray-500">
            Attempt {retryCount} of {maxRetries}
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {canRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-50 min-h-[44px] px-4"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {errorInfo.actionText}
          </Button>
        )}
        
        {showSkip && onSkip && (hasReachedMaxRetries || !canRetry) && (
          <Button
            onClick={onSkip}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:bg-gray-50 min-h-[44px] px-4"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Continue Without Preview
          </Button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-400 max-w-sm">
          <summary className="cursor-pointer">Technical Details</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-left overflow-auto">
            {error}
          </pre>
        </details>
      )}
    </div>
  );
};

export default EnhancedErrorState;
