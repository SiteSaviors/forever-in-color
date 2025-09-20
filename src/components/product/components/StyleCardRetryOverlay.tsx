
import { RefreshCw, AlertCircle } from "lucide-react";

interface StyleCardRetryOverlayProps {
  hasError?: boolean; // Make optional since it's not always passed
  error?: string | null;
  styleName?: string; // Add the missing prop
  onRetry: () => void;
}

const StyleCardRetryOverlay = ({ hasError, error, styleName, onRetry }: StyleCardRetryOverlayProps) => {
  if (!hasError) return null;

  // Parse error message to provide user-friendly feedback
  const getUserFriendlyError = (errorMessage?: string | null) => {
    if (!errorMessage) return `Failed to generate ${styleName || 'style'}. Please try again.`;
    
    if (errorMessage.includes('non-2xx status code') || errorMessage.includes('422')) {
      return 'AI service configuration issue. Retrying with corrected settings...';
    }
    if (errorMessage.includes('aspect ratio')) {
      return 'Image format issue detected. Retrying with compatible settings...';
    }
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
      return 'Connection issue. Please check your internet and try again.';
    }
    if (errorMessage.includes('rate limit')) {
      return 'Too many requests. Please wait a moment before trying again.';
    }
    
    return `Generation failed. Please try again.`;
  };

  return (
    <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
      <div className="text-white text-center space-y-3 px-4">
        <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
        
        <div className="space-y-2">
          <p className="text-sm font-semibold">Generation Failed</p>
          <p className="text-xs text-red-200 max-w-40 mx-auto leading-relaxed">
            {getUserFriendlyError(error)}
          </p>
        </div>

        <button
          onClick={onRetry}
          className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 mx-auto transition-colors backdrop-blur-sm border border-white/20"
        >
          <RefreshCw className="w-3 h-3" />
          Try Again
        </button>
      </div>
    </div>
  );
};

export default StyleCardRetryOverlay;
